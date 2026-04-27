import type { Meta, StoryObj } from "@storybook/nextjs";
import { BriefPanel } from "./BriefPanel";

const meta: Meta<typeof BriefPanel> = {
  title: "Inbox/BriefPanel",
  component: BriefPanel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Right pane of the inbox split view when `brief` is not null (wireframe 02). Renders a 'BRIEF' header, a structured key/value summary (who, need, signals, contact, score), and a scrollable transcript viewer capped at 200 px. Populated from `GET /api/portal/sessions/{id}`.",
      },
    },
  },
  decorators: [(Story) => <div className="w-[420px] p-4"><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof BriefPanel>;

export const Populated: Story = {
  name: "With brief (wireframe 02)",
  args: {
    rows: [
      { key: "who", value: "restaurant owner" },
      { key: "need", value: "monthly bookkeeping + tax" },
      { key: "signals", value: "budget, timeline this month" },
      { key: "contact", value: "budi@example.com" },
      { key: "score", value: "high · qualified" },
    ],
    messages: [
      { role: "user", text: "do you handle restaurants?" },
      { role: "bot", text: "yes, several F&B businesses..." },
      { role: "user", text: "we have 3 outlets..." },
      { role: "bot", text: "got it. for 3 outlets we typically..." },
    ],
  },
};

const LONG_CONVO: { role: "user" | "bot"; text: string }[] = [
  { role: "bot", text: "halo, ada yang bisa kami bantu seputar pembukuan atau pajak?" },
  { role: "user", text: "halo, iya saya mau tanya soal layanan bookkeeping" },
  { role: "bot", text: "tentu! kami melayani pembukuan bulanan, laporan keuangan, dan pajak. untuk berapa karyawan biasanya?" },
  { role: "user", text: "kami punya restoran, 3 outlet, total sekitar 45 karyawan" },
  { role: "bot", text: "baik, untuk 3 outlet F&B kami biasanya tangani pencatatan harian, rekonsiliasi kas, dan laporan bulanan. apakah sudah ada sistem POS?" },
  { role: "user", text: "sudah pakai Moka POS di semua outlet" },
  { role: "bot", text: "bagus sekali! kami sudah familiar dengan export Moka. bisa langsung integrasi ke pembukuan tanpa input manual." },
  { role: "user", text: "kalau pajaknya bagaimana? kami bayar PPh 21 untuk karyawan" },
  { role: "bot", text: "iya, PPh 21 termasuk dalam paket kami. kami juga handle PPh Badan dan PPN jika omzet sudah di atas 4.8M per tahun." },
  { role: "user", text: "omzet kami sekitar 800 juta per bulan untuk semua outlet" },
  { role: "bot", text: "berarti sudah PKP ya. kami akan bantu laporan PPN bulanan juga. apakah selama ini ada kendala dengan SPT Tahunan?" },
  { role: "user", text: "kemarin agak kacau karena akuntannya resign mendadak" },
  { role: "bot", text: "kami sering bantu kasus seperti ini — kami bisa ambil alih dari kondisi berapa pun. biasanya butuh 2-3 hari untuk audit awal." },
  { role: "user", text: "berapa biaya untuk kasus seperti ini?" },
  { role: "bot", text: "untuk detail harga, lebih baik via whatsapp di wa.me/628123456789 karena perlu lihat kondisi pembukuan terakhir dulu." },
  { role: "user", text: "oke, saya mau tanya dulu, apakah bisa mulai bulan depan?" },
  { role: "bot", text: "bisa! kami ada slot untuk onboarding klien baru bulan depan. tim kami akan kontak dalam 1 hari kerja setelah registrasi." },
  { role: "user", text: "registrasinya bagaimana?" },
  { role: "bot", text: "klik tombol 'mulai sekarang' di website kami, atau hubungi langsung via whatsapp. kami yang akan guide prosesnya." },
  { role: "user", text: "ada kontrak berapa bulan minimumnya?" },
  { role: "bot", text: "minimum 3 bulan untuk klien baru, setelah itu bisa bulanan. tidak ada biaya penalti jika berhenti setelah minimum." },
  { role: "user", text: "oke sip, makasih infonya ya" },
  { role: "bot", text: "sama-sama! jangan ragu hubungi kami via whatsapp jika ada pertanyaan lagi. semoga bisa kerjasama segera!" },
];

export const LongConversation: Story = {
  name: "Long conversation (20 turns, scrollable)",
  args: {
    rows: [
      { key: "who", value: "restaurant owner, 3 outlets" },
      { key: "need", value: "bookkeeping takeover + tax (PPh 21, PPN)" },
      { key: "signals", value: "akuntannya resign, omzet 800jt/bln, Moka POS" },
      { key: "contact", value: "via whatsapp" },
      { key: "score", value: "high · qualified" },
    ],
    messages: LONG_CONVO,
  },
};
