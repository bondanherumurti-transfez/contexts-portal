import type { Meta, StoryObj } from "@storybook/nextjs";
import { NoBriefPanel } from "./NoBriefPanel";
import { TranscriptMessage } from "./TranscriptMessage";

const meta: Meta<typeof NoBriefPanel> = {
  title: "Inbox/NoBriefPanel",
  component: NoBriefPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Info card shown in the inbox right pane when `session.brief` is `null` (wireframe 09). Covers both 'unclear' and 'out_of_scope' qualification outcomes — same panel, the parent page varies the status text in the conversation metadata rows above it. The transcript is still shown below this panel.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[420px] p-4"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof NoBriefPanel>;

export const Default: Story = {};

function ConvPane({ messages }: { messages: { role: "user" | "bot"; text: string }[] }) {
  return (
    <div className="w-[420px] p-4">
      <div className="text-[11px] text-text-muted tracking-[1px] uppercase mb-2 font-mono">
        conversation
      </div>
      <div className="flex gap-[10px] text-[12px] py-1">
        <div className="w-[70px] text-text-muted text-[11px] shrink-0">started</div>
        <div className="text-[#444]">apr 25, 14:32 · {messages.length} messages</div>
      </div>
      <div className="flex gap-[10px] text-[12px] py-1">
        <div className="w-[70px] text-text-muted text-[11px] shrink-0">contact</div>
        <div className="text-text-muted">not captured</div>
      </div>
      <div className="flex gap-[10px] text-[12px] py-1">
        <div className="w-[70px] text-text-muted text-[11px] shrink-0">status</div>
        <div className="text-[#444]">unclear · no brief generated</div>
      </div>
      <NoBriefPanel />
      <div className="bg-background-secondary rounded p-[10px] max-h-[200px] overflow-y-auto mt-3">
        {messages.map((m, i) => (
          <TranscriptMessage key={i} role={m.role}>{m.text}</TranscriptMessage>
        ))}
      </div>
    </div>
  );
}

export const WithConversationMeta: Story = {
  name: "No-brief pane (wireframe 09)",
  render: () => (
    <ConvPane
      messages={[
        { role: "bot", text: "halo, ada yang bisa kami bantu?" },
        { role: "user", text: "berapa biaya bookkeeping?" },
        { role: "bot", text: "untuk pricing kami arahkan ke whatsapp..." },
        { role: "user", text: "ok terima kasih" },
      ]}
    />
  ),
};

export const LongConversation: Story = {
  name: "Long conversation (20 turns, scrollable)",
  render: () => (
    <ConvPane
      messages={[
        { role: "bot", text: "halo, ada yang bisa kami bantu?" },
        { role: "user", text: "halo, mau tanya harga bookkeeping dong" },
        { role: "bot", text: "tentu! bisa ceritakan sedikit tentang bisnis Anda?" },
        { role: "user", text: "saya punya toko fashion online, omzet sekitar 50 juta per bulan" },
        { role: "bot", text: "baik, untuk skala itu biasanya paket basic kami cukup. ada berapa transaksi per bulan kira-kira?" },
        { role: "user", text: "sekitar 200-300 transaksi dari berbagai marketplace" },
        { role: "bot", text: "kami terima dari Tokopedia, Shopee, Lazada — semua bisa kami rekonsiliasi otomatis." },
        { role: "user", text: "wah bagus, kalau pajaknya gimana?" },
        { role: "bot", text: "untuk omzet di bawah 500 juta, bisa pakai PPh Final UMKM 0.5%. kami bantu hitung dan lapor." },
        { role: "user", text: "oke, tapi saya belum punya NPWP, bisa dibantu urus?" },
        { role: "bot", text: "bisa! pengurusan NPWP termasuk dalam onboarding kami, gratis." },
        { role: "user", text: "keren. kalau pembukuan untuk 2 toko beda gimana?" },
        { role: "bot", text: "bisa pisah per entitas atau gabung — tergantung kebutuhan Anda. biasanya klien e-commerce gabung dulu." },
        { role: "user", text: "berapa harga pastinya?" },
        { role: "bot", text: "untuk detail harga kami arahkan ke wa.me/628123456789 — perlu lihat volume transaksi tepatnya." },
        { role: "user", text: "ok nanti saya whatsapp. kalau mau mulai bulan depan bisa?" },
        { role: "bot", text: "bisa! onboarding biasanya 3-5 hari kerja. kami perlu akses ke laporan marketplace dan rekening koran." },
        { role: "user", text: "rekening koran bisa export dari BCA ya?" },
        { role: "bot", text: "bisa, format CSV atau PDF keduanya kami terima." },
        { role: "user", text: "oke sip, makasih ya" },
        { role: "bot", text: "sama-sama! tunggu pesan dari tim kami di whatsapp ya. semoga bisa segera mulai!" },
      ]}
    />
  ),
};
