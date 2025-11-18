'use client';

import { useState } from 'react';
import { Button, Group, Text, Progress, Card } from '@mantine/core';
import { IconDownload, IconFileZip } from '@tabler/icons-react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { pdf, Document, Page, View, Text as PdfText, Image as PdfImage, StyleSheet, Font } from '@react-pdf/renderer';

// Register a font for the PDF (optional, using standard Helvetica here)
Font.register({ family: 'Helvetica', fonts: [{ src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf' }] });

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 10, fontFamily: 'Helvetica' },
  guest: { fontSize: 18, marginBottom: 20, color: '#555' },
  qrCode: { width: 150, height: 150 },
  footer: { fontSize: 10, marginTop: 20, color: '#888' },
});

// PDF Template Component
const InvitationPDF = ({ eventName, guestName, qrCodeUrl }: { eventName: string, guestName: string, qrCodeUrl: string }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <PdfText style={styles.title}>Convite: {eventName}</PdfText>
      <PdfText style={styles.guest}>Convidado: {guestName}</PdfText>
      <PdfImage src={qrCodeUrl} style={styles.qrCode} />
      <PdfText style={styles.footer}>Apresente este QR Code na entrada.</PdfText>
    </Page>
  </Document>
);

interface Participant {
  name: string;
}

interface InvitationGeneratorProps {
  event: {
    id: string;
    name: string;
  };
  participants: Participant[];
}

export function InvitationGenerator({ event, participants }: InvitationGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateAndZip = async () => {
    if (participants.length === 0) {
      alert("Adicione participantes antes de gerar convites.");
      return;
    }

    setLoading(true);
    setProgress(0);
    const zip = new JSZip();
    const folder = zip.folder("convites");

    try {
      // Use the window location to build the base URL
      const baseUrl = window.location.origin;

      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        
        // Create a personalized URL: /event/ID?name=GuestName
        // This allows the RSVP form to auto-fill
        const rsvpUrl = `${baseUrl}/event/${event.id}?name=${encodeURIComponent(p.name)}`;
        
        // Generate QR Code
        const qrDataUrl = await QRCode.toDataURL(rsvpUrl, { width: 300, margin: 2 });

        // Generate PDF Blob
        const blob = await pdf(
          <InvitationPDF eventName={event.name} guestName={p.name} qrCodeUrl={qrDataUrl} />
        ).toBlob();

        // Add to Zip
        folder?.file(`${p.name.replace(/[^a-z0-9]/gi, '_')}_convite.pdf`, blob);

        // Update Progress
        setProgress(Math.round(((i + 1) / participants.length) * 100));
      }

      // Generate and Download Zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `convites-${event.name.replace(/\s+/g, '-')}.zip`);

    } catch (error) {
      console.error("Error generating invites:", error);
      alert("Erro ao gerar convites.");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Card withBorder radius="md" p="md" bg="gray.0">
      <Group justify="space-between">
        <div>
          <Text fw={600}>Exportar Convites</Text>
          <Text size="xs" c="dimmed">
            Gera PDFs individuais com QR Code para {participants.length} participante(s).
          </Text>
        </div>
        <Button 
          onClick={generateAndZip} 
          loading={loading} 
          leftSection={loading ? null : <IconFileZip size={18} />}
          color="blue"
          variant="light"
        >
          {loading ? `Gerando (${progress}%)` : 'Baixar ZIP'}
        </Button>
      </Group>
      {loading && <Progress value={progress} size="xs" mt="sm" animated />}
    </Card>
  );
}