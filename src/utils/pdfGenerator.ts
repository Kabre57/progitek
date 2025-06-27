
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Devis, Facture, LigneDevis, Client } from '../types/api';

const formatNumber = (val: number): string => {
  return val.toLocaleString('fr-FR').replace(/\u202F/g, ' ');
};

const addHeader = (doc: jsPDF, titre: string) => {
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 255);
  doc.text('PROGITEK SYSTEM', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(titre, 105, 30, { align: 'center' });
};

const addClientInfo = (doc: jsPDF, client: Client | undefined, x = 130, y = 40) => {
  doc.setFontSize(10);
  doc.text('Client:', x, y);
  doc.text(client?.nom || '', x, y + 5);
  doc.text(client?.entreprise || '', x, y + 10);
  doc.text(client?.email || '', x, y + 15);
};

const generateLignesTable = (doc: jsPDF, lignes: LigneDevis[] = [], startY: number) => {
  const columns = ["Désignation", "Quantité", "Prix unitaire", "Montant HT"];
  const rows = lignes.map(ligne => [
    ligne.designation,
    ligne.quantite.toString(),
    formatNumber(ligne.prixUnitaire) + ' XOF',
    formatNumber(ligne.montantHT) + ' XOF'
  ]);

  (doc as any).autoTable({
    head: [columns],
    body: rows,
    startY,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 51, 153] }
  });

  return (doc as any).lastAutoTable.finalY;
};

const addMontants = (doc: jsPDF, montantHT: number, montantTTC: number, tauxTVA: number, x = 130, y: number) => {
  doc.setFontSize(10);
  doc.text(`Montant HT: ${formatNumber(montantHT)} XOF`, x, y);
  doc.text(`TVA (${tauxTVA}%): ${formatNumber(montantTTC - montantHT)} XOF`, x, y + 5);
  doc.text(`Montant TTC: ${formatNumber(montantTTC)} XOF`, x, y + 10);
};

const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Progitek System - Tous droits réservés', 105, pageHeight - 10, { align: 'center' });
};

const addLongText = (doc: jsPDF, label: string, text: string, startY: number) => {
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const wrapped = doc.splitTextToSize(text, 180);
  doc.text(`${label}`, 15, startY);
  doc.text(wrapped, 15, startY + 5);
  return startY + 5 + wrapped.length * 5;
};

export const generateDevisPDF = async (devis: Devis) => {
  const doc = new jsPDF();

  addHeader(doc, 'DEVIS');

  doc.setFontSize(10);
  doc.text(`Numéro: ${devis.numero}`, 15, 40);
  doc.text(`Date: ${new Date(devis.dateCreation).toLocaleDateString('fr-FR')}`, 15, 45);
  doc.text(`Validité: ${new Date(devis.dateValidite).toLocaleDateString('fr-FR')}`, 15, 50);
  addClientInfo(doc, devis.client);

  doc.setFontSize(12);
  doc.text(devis.titre, 15, 65);
  if (devis.description) doc.text(doc.splitTextToSize(devis.description, 180), 15, 72);

  const finalY = generateLignesTable(doc, devis.lignes, 80);
  addMontants(doc, devis.montantHT, devis.montantTTC, devis.tauxTVA, 130, finalY + 10);

  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  const statutMap: any = {
    'brouillon': 'BROUILLON',
    'envoye': 'EN ATTENTE DE VALIDATION',
    'valide_dg': 'VALIDÉ PAR LA DIRECTION',
    'refuse_dg': 'REFUSÉ PAR LA DIRECTION',
    'accepte_client': 'ACCEPTÉ PAR LE CLIENT',
    'refuse_client': 'REFUSÉ PAR LE CLIENT',
    'facture': 'FACTURÉ'
  };
  doc.text(statutMap[devis.statut] || '', 105, finalY + 25, { align: 'center' });

  let nextY = finalY + 35;
  if (devis.commentaireDG) nextY = addLongText(doc, 'Commentaire Direction:', devis.commentaireDG, nextY);
  if (devis.commentaireClient) nextY = addLongText(doc, 'Commentaire Client:', devis.commentaireClient, nextY + 5);

  addFooter(doc);
  window.open(URL.createObjectURL(doc.output('blob')));
};

export const generateFacturePDF = async (facture: Facture) => {
  const doc = new jsPDF();

  addHeader(doc, 'FACTURE');

  doc.setFontSize(10);
  doc.text(`Numéro: ${facture.numero}`, 15, 40);
  doc.text(`Date d'émission: ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, 15, 45);
  doc.text(`Date d'échéance: ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 15, 50);
  addClientInfo(doc, facture.client);

  doc.text(`Référence devis: ${facture.devis?.numero || ''}`, 15, 60);

  const finalY = generateLignesTable(doc, facture.lignes, 70);
  addMontants(doc, facture.montantHT, facture.montantTTC, facture.tauxTVA, 130, finalY + 10);

  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  const statutMap: any = {
    'emise': 'ÉMISE',
    'envoyee': 'ENVOYÉE',
    'payee': 'PAYÉE',
    'annulee': 'ANNULÉE'
  };
  doc.text(statutMap[facture.statut] || '', 105, finalY + 25, { align: 'center' });

  if (facture.statut === 'payee') {
    let y = finalY + 35;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Informations de paiement:', 15, y);
    doc.text(`Date de paiement: ${facture.datePaiement ? new Date(facture.datePaiement).toLocaleDateString('fr-FR') : '-'}`, 15, y + 5);
    doc.text(`Mode de paiement: ${facture.modePaiement || '-'}`, 15, y + 10);
    if (facture.referenceTransaction)
      doc.text(`Référence: ${facture.referenceTransaction}`, 15, y + 15);
  }

  addFooter(doc);
  window.open(URL.createObjectURL(doc.output('blob')));
};
