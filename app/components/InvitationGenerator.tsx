'use client';

import { useState } from 'react';
import { Button, Group, Text, Progress, Card } from '@mantine/core';
import { IconFileZip } from '@tabler/icons-react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { pdf, Document, Page, View, Text as PdfText, Image as PdfImage, StyleSheet, Font } from '@react-pdf/renderer';

// Register standard font
Font.register({ family: 'Helvetica', fonts: [{ src: 'https://fonts.gstatic.com/s/helvetica/v1/Helvetica.ttf' }] });

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#FFFFFF', padding: 40, alignItems: 'center', justifyContent: 'center' },
  header: { fontSize: 10, color: '#888', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 2 },
  title: { fontSize: 26, marginBottom: 10, fontFamily: 'Helvetica', textAlign: 'center', fontWeight: 'bold' },
  description: { fontSize: 11, marginBottom: 20, color: '#555', textAlign: 'center', lineHeight: 1.4, maxWidth: 400 },
  
  divider: { width: 60, height: 1, backgroundColor: '#E0E0E0', marginVertical: 15 },
  
  section: { marginVertical: 6, alignItems: 'center' },
  label: { fontSize: 9, color: '#999', textTransform: 'uppercase', marginBottom: 2 },
  value: { fontSize: 12, color: '#000', textAlign: 'center', maxWidth: 350 },
  
  qrCode: { width: 140, height: 140, marginTop: 20, marginBottom: 10 },
  cta: { fontSize: 12, color: '#D32F2F', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  
  footer: { fontSize: 9, marginTop: 30, color: '#AAA', textAlign: 'center' },
});

// Enhanced Data Interface
interface InvitationData {
  eventName: string;
  description?: string;
  locationAddress?: string;
  dressCode?: string;
  dates?: string[];
}

// Updated PDF Component
const InvitationPDF = ({ data, guestName, qrCodeUrl }: { data: InvitationData, guestName: string, qrCodeUrl: string }) => (
  <Document>
    <Page size="A5" style={styles.page}>
      <PdfText style={styles.header}>You Are Invited</PdfText>
      
      <PdfText style={styles.title}>{data.eventName}</PdfText>
      
      {/* Sell the event with the description */}
      {data.description && (
        <PdfText style={styles.description}>
          {data.description.length > 200 ? data.description.substring(0, 200) + "..." : data.description}
        </PdfText>
      )}

      <View style={styles.divider} />

      <View style={styles.section}>
        <PdfText style={styles.label}>Guest Name</PdfText>
        <PdfText style={styles.value}>{guestName}</PdfText>
      </View>

      {/* Conditionally render details to keep layout clean */}
      {(data.dates && data.dates.length > 0) && (
        <View style={styles.section}>
           <PdfText style={styles.label}>Date</PdfText>
           <PdfText style={styles.value}>{data.dates.join(', ')}</PdfText>
        </View>
      )}

      {data.locationAddress && (
        <View style={styles.section}>
          <PdfText style={styles.label}>Location</PdfText>
          <PdfText style={styles.value}>{data.locationAddress}</PdfText>
        </View>
      )}

      {data.dressCode && (
        <View style={styles.section}>
          <PdfText style={styles.label}>Dress Code</PdfText>
          <PdfText style={styles.value}>{data.dressCode}</PdfText>
        </View>
      )}

      {/* The 'Hook' */}
      <PdfImage src={qrCodeUrl} style={styles.qrCode} />
      <PdfText style={styles.cta}>Scan to RSVP</PdfText>
      
      <PdfText style={styles.footer}>Please confirm your attendance to access the full menu and schedule.</PdfText>
    </Page>
  </Document>
);

interface Participant {
  name: string;
}

// Updated Props to accept full event details
interface InvitationGeneratorProps {
  event: {
    id: string;
    name: string;
    description?: string;
    locationAddress?: string;
    dressCode?: string;
    availableDates?: string[];
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
      const baseUrl = window.location.origin;

      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        
        // Personalized URL for RSVP
        const rsvpUrl = `${baseUrl}/event/${event.id}?name=${encodeURIComponent(p.name)}`;
        
        // Generate QR Code
        const qrDataUrl = await QRCode.toDataURL(rsvpUrl, { width: 300, margin: 2, color: { dark: '#171717', light: '#ffffff' } });

        // Prepare rich data for the PDF
        const inviteData: InvitationData = {
            eventName: event.name,
            description: event.description,
            locationAddress: event.locationAddress,
            dressCode: event.dressCode,
            dates: event.availableDates
        };

        // Generate PDF Blob
        const blob = await pdf(
          <InvitationPDF data={inviteData} guestName={p.name} qrCodeUrl={qrDataUrl} />
        ).toBlob();

        folder?.file(`${p.name.replace(/[^a-z0-9]/gi, '_')}_convite.pdf`, blob);
        setProgress(Math.round(((i + 1) / participants.length) * 100));
      }

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
          <Text fw={600}>Exportar Convites (PDF)</Text>
          <Text size="xs" c="dimmed">
            Gera PDFs detalhados com QR Code para {participants.length} participante(s).
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