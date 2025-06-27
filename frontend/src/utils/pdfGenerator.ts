
import { jsPDF } from 'jspdf'; 
import 'jspdf-autotable';
import { Devis, Client, DevisLigne } from '../types/api';
import  {logoBase64}  from '../utils/logoBase64'; // Assure-toi que ce fichier existe

const formatNumber = (val: number): string => {
  return val.toLocaleString('fr-FR').replace(/\u202F/g, ' ');
};

const addHeader = (doc: jsPDF, titre: string) => {
  try {
    doc.addImage(logoBase64, 'PNG', 15, 10, 30, 20);
  } catch (e) {
    console.error('Erreur insertion logo:', e);
  }

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 255);
  doc.text('PROGITEK SYSTEM', 105, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(titre, 105, 30, { align: 'center' });
};

const addClientInfo = (doc: jsPDF, client: Client | undefined, x = 130, y = 40) => {
  try {
    if (!client) return;
    doc.setFontSize(10);
    doc.text('Client:', x, y);
    doc.text(client.nom || '', x, y + 5);
    doc.text(client.entreprise || '', x, y + 10);
    doc.text(client.email || '', x, y + 15);
  } catch (e) {
    console.error("Erreur info client :", e);
  }
};

const generateLignesTable = (doc: jsPDF, lignes: DevisLigne[] = [], startY: number) => {
  try {
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
  } catch (e) {
    console.error("Erreur tableau lignes :", e);
    return startY;
  }
};

const addMontants = (doc: jsPDF, montantHT: number, montantTTC: number, tauxTVA: number, x = 130, y: number) => {
  try {
    doc.setFontSize(10);
    doc.text(`Montant HT: ${formatNumber(montantHT)} XOF`, x, y);
    doc.text(`TVA (${tauxTVA}%): ${formatNumber(montantTTC - montantHT)} XOF`, x, y + 5);
    doc.text(`Montant TTC: ${formatNumber(montantTTC)} XOF`, x, y + 10);
  } catch (e) {
    console.error("Erreur montants :", e);
  }
};

const addFooter = (doc: jsPDF) => {
  try {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Progitek System - Tous droits réservés', 105, pageHeight - 10, { align: 'center' });
  } catch (e) {
    console.error("Erreur pied de page :", e);
  }
};

const addLongText = (doc: jsPDF, label: string, text: string, startY: number) => {
  try {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const wrapped = doc.splitTextToSize(text, 180);
    doc.text(`${label}`, 15, startY);
    doc.text(wrapped, 15, startY + 5);
    return startY + 5 + wrapped.length * 5;
  } catch (e) {
    console.error("Erreur long texte :", e);
    return startY;
  }
};

export const generateDevisPDF = async (devis: Devis) => {
  try {
    const doc = new jsPDF();

    console.log("Génération PDF pour devis :", devis);

    addHeader(doc, 'DEVIS');

    doc.setFontSize(10);
    doc.text(`Numéro: ${devis.numero}`, 15, 40);
    doc.text(`Date: ${new Date(devis.dateCreation).toLocaleDateString('fr-FR')}`, 15, 45);
    doc.text(`Validité: ${new Date(devis.dateValidite).toLocaleDateString('fr-FR')}`, 15, 50);

    addClientInfo(doc, devis.client);

    doc.setFontSize(12);
    doc.text(devis.titre, 15, 65);
    if (devis.description) {
      doc.text(doc.splitTextToSize(devis.description, 180), 15, 72);
    }

    const finalY = generateLignesTable(doc, devis.lignes || [], 80);
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
  } catch (err) {
    console.error('Erreur globale lors de la génération du PDF:', err);
    throw err;
  }
};
