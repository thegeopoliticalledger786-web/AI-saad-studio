import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Tab = "chat" | "image" | "write" | "code" | "translate";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [copied, setCopied] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `السلام علیکم ورحمۃ اللہ وبرکاتہ 🌸

Main Hafiz Saad Sir ka AI hoon 🤖, aur main har waqt aap ki madad ke liye available hoon. Agar aap ko kisi bhi qisam ki guidance ya support ki zarurat ho, to bejhijhak mujh se pooch sakte hain 💡.

Shuru karne ke liye “AI Future” WhatsApp channel join karein 📲. tak e apko mukhtlif aI aur tools ki update multi rhy 

Agar aap ko kisi bhi help ki zarurat ho ya online commission-based kaam karna chahte hain 💼, to aap seedha Saad Bhai se contact kar sakte hain 📩.

🙏 Saad Sir ko duaon mein yaad rakhiye 💖`
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatMsgsRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.chat.sendMessage.useMutation();

  // Image Prompt state
  const [imgPrompt, setImgPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Photorealistic");
  const [imgOutput, setImgOutput] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const imgMutation = trpc.imagePrompt.generate.useMutation();

  // Content Writer state
  const [writeTopic, setWriteTopic] = useState("");
  const [writeType, setWriteType] = useState("blog");
  const [writeLang, setWriteLang] = useState("Urdu");
  const [writeOutput, setWriteOutput] = useState("");
  const writeMutation = trpc.content.generate.useMutation();

  // Code Helper state
  const [codeDesc, setCodeDesc] = useState("");
  const [codeLang, setCodeLang] = useState("JavaScript");
  const [codeOutput, setCodeOutput] = useState("");
  const codeMutation = trpc.code.generate.useMutation();

  // Translator state
  const [transText, setTransText] = useState("");
  const [transFrom, setTransFrom] = useState("Auto Detect");
  const [transTo, setTransTo] = useState("English");
  const [transOutput, setTransOutput] = useState("");
  const transMutation = trpc.translate.translate.useMutation();

  // Auto-scroll chat
  useEffect(() => {
    if (chatMsgsRef.current) {
      chatMsgsRef.current.scrollTop = chatMsgsRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });
      const result = await response.json();
      const replyText = result.reply || result.error || "No response";
      setChatMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch (error) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "❌ Error: Could not process your message. Please try again." }]);
    }
  };

  const generateImagePrompt = async () => {
    if (!imgPrompt.trim()) {
      toast.error("Please enter a description");
      return;
    }
    try {
      const result = await imgMutation.mutateAsync({ description: imgPrompt, style: selectedStyle });
      setImgOutput(result.prompt);
      if (result.imageUrl) {
        setGeneratedImageUrl(result.imageUrl);
      }
    } catch (error) {
      toast.error("Failed to generate prompt");
    }
  };

  const generateContent = async () => {
    if (!writeTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    try {
      const result = await writeMutation.mutateAsync({ topic: writeTopic, type: writeType, language: writeLang });
      setWriteOutput(result.content);
    } catch (error) {
      toast.error("Failed to generate content");
    }
  };

  const generateCode = async () => {
    if (!codeDesc.trim()) {
      toast.error("Please describe what you need");
      return;
    }
    try {
      const result = await codeMutation.mutateAsync({ description: codeDesc, language: codeLang });
      setCodeOutput(result.code);
    } catch (error) {
      toast.error("Failed to generate code");
    }
  };

  const translate = async () => {
    if (!transText.trim()) {
      toast.error("Please enter text to translate");
      return;
    }
    try {
      const result = await transMutation.mutateAsync({ text: transText, from: transFrom, to: transTo });
      setTransOutput(result.translation);
    } catch (error) {
      toast.error("Failed to translate");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2e] to-[#2a2a3e]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">🎨 AI Saad Studio</h1>
          <p className="text-white/90 text-lg">Advanced AI Tools — Chat, Images, Writing & More</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(["chat", "image", "write", "code", "translate"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white shadow-lg"
                  : "bg-[#2a2a3e] text-white hover:bg-[#3a3a4e] border border-[#3a3a4e]"
              }`}
            >
              {tab === "chat" && "💬 AI Chatbot"}
              {tab === "image" && "🖼️ AI Image Generator"}
              {tab === "write" && "✍️ AI Writer"}
              {tab === "code" && "💻 Code Helper"}
              {tab === "translate" && "🌍 Translator"}
            </button>
          ))}
        </div>

        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="bg-[#2a2a3e] rounded-xl p-8 border border-[#3a3a4e] shadow-xl">
            <h2 className="text-2xl font-bold text-[#6366f1] mb-2">💬 AI Chatbot</h2>
            <p className="text-[#a0a0b0] mb-6">Powered by Advanced AI — Ask anything!</p>
            <div className="bg-[#1e1e2e] rounded-lg h-96 overflow-y-auto mb-4 p-4 border border-[#3a3a4e]" ref={chatMsgsRef}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] md:max-w-md px-4 py-3 rounded-lg whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#6366f1] text-white rounded-br-none"
                        : "bg-[#3a3a4e] text-white rounded-bl-none border border-[#4a4a5e]"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChat()}
                  placeholder="Message likhein..."
                  className="flex-1 px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#6366f1]"
                />
                <Button
                  onClick={sendChat}
                  disabled={chatMutation.isPending}
                  className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:shadow-lg"
                >
                  {chatMutation.isPending ? <Loader2 className="animate-spin" /> : "Send"}
                </Button>
              </div>
              <a
                href="https://whatsapp.com/channel/0029Vb4wRJBBadmUDIOh5A1E"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold flex items-center justify-center gap-2 py-6 text-lg shadow-lg transition-all transform hover:scale-[1.02]">
                  📲 Join AI Future WhatsApp Channel
                </Button>
              </a>
            </div>
          </div>
        )}

        {/* Image Generator Tab */}
        {activeTab === "image" && (
          <div className="bg-[#2a2a3e] rounded-xl p-8 border border-[#3a3a4e] shadow-xl">
            <h2 className="text-2xl font-bold text-[#6366f1] mb-6">🖼️ AI Image Generator (Script to Image)</h2>
            <div className="mb-6">
              <label className="block text-[#a0a0b0] mb-2 font-semibold">Image ka description ya script likhein</label>
              <textarea
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                placeholder="Jaise: A futuristic city at sunset with flying cars, high resolution, 8k..."
                className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#6366f1] min-h-24"
              />
            </div>
            <div className="mb-6">
              <label className="block text-[#a0a0b0] mb-3 font-semibold">Style Select Karein</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Photorealistic", "Digital Art", "Anime", "Oil Painting", "3D Render", "Watercolor"].map((style) => (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedStyle === style
                        ? "bg-[#6366f1] border-[#6366f1] text-white"
                        : "bg-[#1e1e2e] border-[#3a3a4e] text-white hover:border-[#6366f1]"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={generateImagePrompt}
              disabled={imgMutation.isPending}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:shadow-lg mb-6 py-6 text-lg"
            >
              {imgMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "🎨"} Image Generate Karein
            </Button>
            
            {generatedImageUrl && (
              <div className="mb-8 bg-[#1e1e2e] rounded-xl p-4 border border-[#3a3a4e] overflow-hidden">
                <h3 className="text-[#10b981] font-semibold mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5" /> Generated Image
                </h3>
                <div className="relative group rounded-lg overflow-hidden border border-[#3a3a4e] bg-black/20">
                  <img 
                    src={generatedImageUrl} 
                    alt="AI Generated" 
                    className="w-full h-auto object-contain max-h-[600px] transition-transform duration-500 group-hover:scale-[1.02]"
                    onLoad={() => toast.success("Image loaded successfully!")}
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <a 
                      href={generatedImageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-[#6366f1] text-white rounded-full shadow-lg hover:bg-[#4f46e5] transition-all"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {imgOutput && (
              <div className="bg-[#1e1e2e] rounded-lg p-4 border border-[#3a3a4e]">
                <h3 className="text-[#6366f1] font-semibold mb-3">📝 Enhanced Prompt Used</h3>
                <p className="text-white/80 text-sm italic whitespace-pre-wrap mb-4">{imgOutput}</p>
                <Button
                  onClick={() => copyToClipboard(imgOutput)}
                  variant="outline"
                  className="border-[#3a3a4e] text-white hover:bg-[#3a3a4e]"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Prompt
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content Writer Tab */}
        {activeTab === "write" && (
          <div className="bg-[#2a2a3e] rounded-xl p-8 border border-[#3a3a4e] shadow-xl">
            <h2 className="text-2xl font-bold text-[#6366f1] mb-6">✍️ AI Content Writer</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[#a0a0b0] mb-2 font-semibold">Content Type</label>
                <select
                  value={writeType}
                  onChange={(e) => setWriteType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                >
                  <option>blog</option>
                  <option>social</option>
                  <option>email</option>
                  <option>story</option>
                  <option>bio</option>
                  <option>poem</option>
                </select>
              </div>
              <div>
                <label className="block text-[#a0a0b0] mb-2 font-semibold">Language</label>
                <select
                  value={writeLang}
                  onChange={(e) => setWriteLang(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                >
                  <option>Urdu</option>
                  <option>English</option>
                  <option>Roman Urdu</option>
                </select>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-[#a0a0b0] mb-2 font-semibold">Topic ya details likhein</label>
              <textarea
                value={writeTopic}
                onChange={(e) => setWriteTopic(e.target.value)}
                placeholder="Jaise: AI technology ke fayde, 500 words mein..."
                className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#6366f1] min-h-24"
              />
            </div>
            <Button
              onClick={generateContent}
              disabled={writeMutation.isPending}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:shadow-lg mb-6"
            >
              {writeMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "✍️"} Content Generate Karein
            </Button>
            {writeOutput && (
              <div className="bg-[#1e1e2e] rounded-lg p-4 border border-[#3a3a4e]">
                <h3 className="text-[#10b981] font-semibold mb-3">✅ Generated Content</h3>
                <p className="text-white whitespace-pre-wrap mb-4">{writeOutput}</p>
                <Button
                  onClick={() => copyToClipboard(writeOutput)}
                  variant="outline"
                  className="border-[#3a3a4e] text-white hover:bg-[#3a3a4e]"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Karein
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Code Helper Tab */}
        {activeTab === "code" && (
          <div className="bg-[#2a2a3e] rounded-xl p-8 border border-[#3a3a4e] shadow-xl">
            <h2 className="text-2xl font-bold text-[#6366f1] mb-6">💻 Code Helper</h2>
            <div className="mb-6">
              <label className="block text-[#a0a0b0] mb-2 font-semibold">Programming Language</label>
              <select
                value={codeLang}
                onChange={(e) => setCodeLang(e.target.value)}
                className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
              >
                <option>Python</option>
                <option>JavaScript</option>
                <option>HTML/CSS</option>
                <option>PHP</option>
                <option>C++</option>
                <option>Java</option>
                <option>SQL</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-[#a0a0b0] mb-2 font-semibold">Kya code chahiye? (describe karein)</label>
              <textarea
                value={codeDesc}
                onChange={(e) => setCodeDesc(e.target.value)}
                placeholder="Jaise: Login form with validation in JavaScript..."
                className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#6366f1] min-h-24"
              />
            </div>
            <Button
              onClick={generateCode}
              disabled={codeMutation.isPending}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:shadow-lg mb-6"
            >
              {codeMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "💻"} Code Generate Karein
            </Button>
            {codeOutput && (
              <div className="bg-[#1e1e2e] rounded-lg p-4 border border-[#3a3a4e] overflow-x-auto">
                <h3 className="text-[#10b981] font-semibold mb-3">✅ Generated Code</h3>
                <pre className="text-white font-mono text-sm mb-4 whitespace-pre-wrap">{codeOutput}</pre>
                <Button
                  onClick={() => copyToClipboard(codeOutput)}
                  variant="outline"
                  className="border-[#3a3a4e] text-white hover:bg-[#3a3a4e]"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Karein
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Translator Tab */}
        {activeTab === "translate" && (
          <div className="bg-[#2a2a3e] rounded-xl p-8 border border-[#3a3a4e] shadow-xl">
            <h2 className="text-2xl font-bold text-[#6366f1] mb-6">🌍 AI Translator</h2>
            <div className="mb-6">
              <label className="block text-[#a0a0b0] mb-2 font-semibold">Text likhein</label>
              <textarea
                value={transText}
                onChange={(e) => setTransText(e.target.value)}
                placeholder="Yahan apna text likhein..."
                className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white placeholder-[#a0a0b0] focus:outline-none focus:border-[#6366f1] min-h-24"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[#a0a0b0] mb-2 font-semibold">Se (From)</label>
                <select
                  value={transFrom}
                  onChange={(e) => setTransFrom(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                >
                  <option>Auto Detect</option>
                  <option>Urdu</option>
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Hindi</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label className="block text-[#a0a0b0] mb-2 font-semibold">Mein (To)</label>
                <select
                  value={transTo}
                  onChange={(e) => setTransTo(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1e1e2e] border border-[#3a3a4e] rounded-lg text-white focus:outline-none focus:border-[#6366f1]"
                >
                  <option>English</option>
                  <option>Urdu</option>
                  <option>Arabic</option>
                  <option>Hindi</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>
            </div>
            <Button
              onClick={translate}
              disabled={transMutation.isPending}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:shadow-lg mb-6"
            >
              {transMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : "🌍"} Translate Karein
            </Button>
            {transOutput && (
              <div className="bg-[#1e1e2e] rounded-lg p-4 border border-[#3a3a4e]">
                <h3 className="text-[#10b981] font-semibold mb-3">✅ Translation</h3>
                <p className="text-white whitespace-pre-wrap mb-4 text-lg">{transOutput}</p>
                <Button
                  onClick={() => copyToClipboard(transOutput)}
                  variant="outline"
                  className="border-[#3a3a4e] text-white hover:bg-[#3a3a4e]"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  Copy Karein
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#2a2a3e] border-t border-[#3a3a4e] mt-16 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-[#6366f1] mb-2">🚀 AI Saad Studio</h3>
          <p className="text-[#a0a0b0] mb-6">Advanced AI tools — bilkul free, bilkul easy</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/923133488621"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-5 h-5 invert" />
              📱 WhatsApp Karein
            </a>
            <a
              href="https://t.me/saadstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-[#0088cc] to-[#005f99] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              ✈️ Telegram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
