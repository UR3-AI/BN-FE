import { HelpIcon } from "@/mock/app/components/Icons";
import { GlobalLayout } from "@/mock/app/components/layout";

const faqItems = [
  {
    question: "Keyboard Shortcuts",
    answer:
      "Ctrl+N: New note, Ctrl+S: Save, Ctrl+K: Quick search, Ctrl+Shift+P: Command palette, Ctrl+B: Toggle sidebar.",
  },
  {
    question: "How do I create a new note?",
    answer:
      'Click the "New Node" button in the sidebar, or use the Ctrl+N shortcut. Your note will be automatically saved and processed by AI.',
  },
  {
    question: "How does the Knowledge Graph work?",
    answer:
      "The Knowledge Graph automatically maps relationships between your notes using AI-powered semantic analysis. Related notes are connected based on content similarity.",
  },
  {
    question: "Can I export my notes?",
    answer:
      "Yes! Open any note in the Editor and use the Export MD or Export PDF buttons to download your content in your preferred format.",
  },
  {
    question: "How do tags work?",
    answer:
      "Tags help you categorize notes. Add tags manually in the Editor, or let AI suggest tags during note processing. Use the Search page to filter by tags.",
  },
  {
    question: "What is the Chat feature?",
    answer:
      "Chat lets you have AI-powered conversations about your notes. Ask questions, get summaries, or explore connections across your knowledge base.",
  },
];

const HelpPage = () => {
  return (
    <GlobalLayout
      topbarTitle="Help"
      showSearch={false}>
      <div className="flex-1 overflow-y-auto p-[2.4rem] md:p-[4rem]">
        <div className="mx-auto max-w-[72rem]">
          <div className="mb-[4rem] flex items-center gap-[1.6rem]">
            <div className="flex h-[4.8rem] w-[4.8rem] items-center justify-center rounded-[0.8rem] bg-primary/10">
              <HelpIcon size="2.4rem" />
            </div>
            <div>
              <h2 className="font-headline text-[2.4rem] font-bold text-on-surface">
                Help & FAQ
              </h2>
              <p className="text-[1.4rem] text-on-surface-variant">
                Frequently asked questions and tips
              </p>
            </div>
          </div>

          <div className="space-y-[1.6rem]">
            {faqItems.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-[0.5rem] bg-surface-container-low p-[2.4rem] shadow-sm">
                <summary className="cursor-pointer list-none font-headline text-[1.6rem] font-semibold text-on-surface transition-colors group-open:text-primary">
                  {question}
                </summary>
                <p className="mt-[1.6rem] text-[1.4rem] leading-relaxed text-on-surface-variant">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </GlobalLayout>
  );
};

export default HelpPage;
