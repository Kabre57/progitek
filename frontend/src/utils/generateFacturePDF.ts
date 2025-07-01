
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Facture, Client, FactureLigne } from '../types/api';
import { logoBase64 } from '../utils/logoBase64';

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

const generateLignesTable = (doc: jsPDF, lignes: FactureLigne[] = [], startY: number) => {
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

export const generateFacturePDF = async (facture: Facture) => {
  try {
    const doc = new jsPDF();

    addHeader(doc, 'FACTURE');

    doc.setFontSize(10);
    doc.text(`Numéro: ${facture.numero}`, 15, 40);
    doc.text(`Date d'émission: ${new Date(facture.dateEmission).toLocaleDateString('fr-FR')}`, 15, 45);
    doc.text(`Date d'échéance: ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, 15, 50);
    addClientInfo(doc, facture.client);

    doc.text(`Référence devis: ${facture.devis?.numero || ''}`, 15, 60);

    // Titre et description depuis le devis
    doc.setFontSize(12);
    doc.text(facture.devis?.titre || '', 15, 65);
    if (facture.devis?.description) {
      doc.text(doc.splitTextToSize(facture.devis.description, 180), 15, 72);
    }

    const finalY = generateLignesTable(doc, facture.lignes || [], 80);
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
  } catch (err) {
    console.error('Erreur lors de la génération du PDF Facture:', err);
    throw err;
  }
};
