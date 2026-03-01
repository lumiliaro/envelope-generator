import { jsPDF } from "jspdf";
import {
    Download,
    Globe,
    Mail,
    MapPin,
    Move,
    Printer,
    Settings,
    Type,
    User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";

const TRANSLATIONS = {
    de: {
        appTitle: "Briefumschlag Druck",
        appSubtitle: "PDF Generator & Designer",
        formatOrientation: "Format & Ausrichtung",
        landscape: "Querformat",
        portrait: "Hochformat",
        sender: "Absender",
        recipient: "Empfänger",
        placeholder:
            "Max Mustermann\nMusterstraße 1\n12345 Musterstadt\nGERMANY",
        bold: "Fett",
        italic: "Kursiv",
        print: "Drucken",
        export: "Export",
        frankZone: "Frankierung",
        windowZone: "Sichtfenster",
        formats: {
            "DIN Lang (mit Fenster)": "DIN Lang (mit Fenster)",
            "DIN Lang (ohne Fenster)": "DIN Lang (ohne Fenster)",
            "C4 (Großbrief)": "C4 (Großbrief)",
            "C5 (Kompaktbrief)": "C5 (Kompaktbrief)",
            "C6 (Standardbrief)": "C6 (Standardbrief)",
            "B4 (Großformat)": "B4 (Großformat)",
            "B5 (Zwischenformat)": "B5 (Zwischenformat)",
            "Quadratisch (155 x 155)": "Quadratisch (155 x 155)",
            "Quadratisch Groß (220 x 220)": "Quadratisch Groß (220 x 220)",
        },
    },
    en: {
        appTitle: "Envelope Print",
        appSubtitle: "PDF Generator & Designer",
        formatOrientation: "Format & Orientation",
        landscape: "Landscape",
        portrait: "Portrait",
        sender: "Sender",
        recipient: "Recipient",
        placeholder: "John Doe\n123 Main Street\nNew York, NY 10001\nUSA",
        bold: "Bold",
        italic: "Italic",
        print: "Print",
        export: "Export",
        frankZone: "Postage",
        windowZone: "Window",
        formats: {
            "DIN Lang (mit Fenster)": "DIN Lang (with Window)",
            "DIN Lang (ohne Fenster)": "DIN Lang (no Window)",
            "C4 (Großbrief)": "C4 (Large Envelope)",
            "C5 (Kompaktbrief)": "C5 (Compact)",
            "C6 (Standardbrief)": "C6 (Standard)",
            "B4 (Großformat)": "B4 (Large Format)",
            "B5 (Zwischenformat)": "B5 (Medium Format)",
            "Quadratisch (155 x 155)": "Square (155 x 155)",
            "Quadratisch Groß (220 x 220)": "Large Square (220 x 220)",
        },
    },
};

const FORMATS = {
    "DIN Lang (mit Fenster)": {
        width: 220,
        height: 110,
        window: { x: 20, y: 45, width: 90, height: 45 },
        stamp: { width: 74, height: 40 },
    },
    "DIN Lang (ohne Fenster)": {
        width: 220,
        height: 110,
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "C4 (Großbrief)": {
        width: 324,
        height: 229,
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "C5 (Kompaktbrief)": {
        width: 229,
        height: 162,
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "C6 (Standardbrief)": {
        width: 162,
        height: 114,
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "B4 (Großformat)": {
        width: 353,
        height: 250,
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "B5 (Zwischenformat)": {
        width: 250,
        height: 176,
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "Quadratisch (155 x 155)": {
        width: 155,
        height: 155,
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "Quadratisch Groß (220 x 220)": {
        width: 220,
        height: 220,
        window: null,
        stamp: { width: 74, height: 40 },
    },
};

const SCALE = 3;
const PT_TO_PX = (25.4 / 72) * SCALE;

const AddressCard = ({
    title,
    icon: Icon,
    data,
    setData,
    maxWidth,
    maxHeight,
    t,
}) => {
    const handleXChange = (e) => {
        let val = e.target.value;
        if (val === "") return setData({ ...data, x: "" });

        val = Number(val);
        if (val < 0) val = 0;

        const safeMax = Math.max(0, maxWidth - 40);
        if (val > safeMax) val = safeMax;

        setData({ ...data, x: val });
    };

    const handleYChange = (e) => {
        let val = e.target.value;
        if (val === "") return setData({ ...data, y: "" });

        val = Number(val);
        if (val < 0) val = 0;

        const safeMax = Math.max(0, maxHeight - 20);
        if (val > safeMax) val = safeMax;

        setData({ ...data, y: val });
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                <Icon size={18} className="text-blue-500" />
                <h3>{title}</h3>
            </div>

            <textarea
                value={data.text}
                onChange={(e) => setData({ ...data, text: e.target.value })}
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none mb-4"
                placeholder={t.placeholder}
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
                        <Move size={12} /> X (mm)
                    </label>
                    <input
                        type="number"
                        value={data.x}
                        onChange={handleXChange}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
                        <Move size={12} className="rotate-90" /> Y (mm)
                    </label>
                    <input
                        type="number"
                        value={data.y}
                        onChange={handleYChange}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 w-full">
                    <Type size={14} className="text-slate-400 shrink-0" />

                    <select
                        value={data.fontFamily || "helvetica"}
                        onChange={(e) =>
                            setData({ ...data, fontFamily: e.target.value })
                        }
                        className="flex-1 p-1.5 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="helvetica">Helvetica</option>
                        <option value="times">Times (Serif)</option>
                        <option value="courier">Courier (Mono)</option>
                    </select>

                    <div className="flex items-center gap-1">
                        {/* NEU: w-[72px] statt w-12 für ca. 50% mehr Breite */}
                        <input
                            type="number"
                            value={data.fontSize}
                            onChange={(e) =>
                                setData({
                                    ...data,
                                    fontSize: Number(e.target.value),
                                })
                            }
                            className="w-[72px] p-1.5 text-center border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-500">pt</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.isBold}
                            onChange={(e) =>
                                setData({ ...data, isBold: e.target.checked })
                            }
                            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="font-bold text-slate-700">
                            {t.bold}
                        </span>
                    </label>
                    <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={data.isItalic}
                            onChange={(e) =>
                                setData({ ...data, isItalic: e.target.checked })
                            }
                            className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="italic text-slate-700">
                            {t.italic}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

const getPreviewFontFamily = (font) => {
    if (font === "times") return '"Times New Roman", Times, serif';
    if (font === "courier") return '"Courier New", Courier, monospace';
    return "Helvetica, Arial, sans-serif";
};

export default function App() {
    const [lang, setLang] = useState(() => {
        return localStorage.getItem("envelopeLang") || "de";
    });

    const t = TRANSLATIONS[lang];

    const [format, setFormat] = useState(() => {
        const savedFormat = localStorage.getItem("envelopeFormat");
        const parsed = savedFormat
            ? JSON.parse(savedFormat)
            : "DIN Lang (ohne Fenster)";
        return FORMATS[parsed] ? parsed : "DIN Lang (ohne Fenster)";
    });

    const [isLandscape, setIsLandscape] = useState(() => {
        const saved = localStorage.getItem("envelopeOrientation");
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [sender, setSender] = useState(() => {
        const savedSender = localStorage.getItem("envelopeSender");
        if (savedSender) {
            const parsed = JSON.parse(savedSender);
            if (parsed.text.includes("Max Mustermann")) parsed.text = "";
            return { fontFamily: "helvetica", ...parsed };
        }
        return {
            text: "",
            x: 10,
            y: 10,
            fontSize: 10,
            isBold: false,
            isItalic: false,
            fontFamily: "helvetica",
        };
    });

    const [recipient, setRecipient] = useState(() => {
        const savedRecipient = localStorage.getItem(
            "envelopeRecipientSettings",
        );
        if (savedRecipient) {
            const parsed = JSON.parse(savedRecipient);
            return { fontFamily: "helvetica", ...parsed, text: "" };
        }
        return {
            text: "",
            x: 120,
            y: 55,
            fontSize: 12,
            isBold: true,
            isItalic: false,
            fontFamily: "helvetica",
        };
    });

    useEffect(() => localStorage.setItem("envelopeLang", lang), [lang]);
    useEffect(
        () => localStorage.setItem("envelopeFormat", JSON.stringify(format)),
        [format],
    );
    useEffect(
        () =>
            localStorage.setItem(
                "envelopeOrientation",
                JSON.stringify(isLandscape),
            ),
        [isLandscape],
    );
    useEffect(
        () => localStorage.setItem("envelopeSender", JSON.stringify(sender)),
        [sender],
    );
    useEffect(
        () =>
            localStorage.setItem(
                "envelopeRecipientSettings",
                JSON.stringify(recipient),
            ),
        [recipient],
    );

    const senderRef = useRef(null);
    const recipientRef = useRef(null);

    const baseDims = FORMATS[format];
    const currentDims = {
        ...baseDims,
        width: isLandscape ? baseDims.width : baseDims.height,
        height: isLandscape ? baseDims.height : baseDims.width,
        window: baseDims.window
            ? {
                  x: isLandscape ? baseDims.window.x : baseDims.window.y,
                  y: isLandscape ? baseDims.window.y : baseDims.window.x,
                  width: isLandscape
                      ? baseDims.window.width
                      : baseDims.window.height,
                  height: isLandscape
                      ? baseDims.window.height
                      : baseDims.window.width,
              }
            : null,
        stamp: baseDims.stamp,
    };

    useEffect(() => {
        setSender((prev) => {
            const safeX = Math.min(
                Number(prev.x) || 0,
                Math.max(0, currentDims.width - 40),
            );
            const safeY = Math.min(
                Number(prev.y) || 0,
                Math.max(0, currentDims.height - 20),
            );
            if (safeX !== prev.x || safeY !== prev.y)
                return { ...prev, x: safeX, y: safeY };
            return prev;
        });
        setRecipient((prev) => {
            const safeX = Math.min(
                Number(prev.x) || 0,
                Math.max(0, currentDims.width - 40),
            );
            const safeY = Math.min(
                Number(prev.y) || 0,
                Math.max(0, currentDims.height - 20),
            );
            if (safeX !== prev.x || safeY !== prev.y)
                return { ...prev, x: safeX, y: safeY };
            return prev;
        });
    }, [currentDims.width, currentDims.height]);

    const getFontStyle = (isBold, isItalic) => {
        if (isBold && isItalic) return "bolditalic";
        if (isBold) return "bold";
        if (isItalic) return "italic";
        return "normal";
    };

    const createPDF = () => {
        const doc = new jsPDF({
            orientation: isLandscape ? "landscape" : "portrait",
            unit: "mm",
            format: [baseDims.width, baseDims.height],
        });

        if (sender.text) {
            doc.setFontSize(sender.fontSize);
            doc.setFont(
                sender.fontFamily || "helvetica",
                getFontStyle(sender.isBold, sender.isItalic),
            );
            doc.text(
                sender.text.split("\n"),
                Number(sender.x) || 0,
                Number(sender.y) || 0,
            );
        }

        if (recipient.text) {
            doc.setFontSize(recipient.fontSize);
            doc.setFont(
                recipient.fontFamily || "helvetica",
                getFontStyle(recipient.isBold, recipient.isItalic),
            );
            doc.text(
                recipient.text.split("\n"),
                Number(recipient.x) || 0,
                Number(recipient.y) || 0,
            );
        }

        return doc;
    };

    const handleExportPDF = () => {
        const doc = createPDF();
        doc.save(`Envelope_${format.replace(/ /g, "_")}.pdf`);
    };

    const handlePrint = () => {
        const doc = createPDF();
        doc.autoPrint();
        window.open(doc.output("bloburl"), "_blank");
    };

    const handleDrag = (e, data, setter) => {
        setter((prev) => ({
            ...prev,
            x: Math.round(data.x / SCALE),
            y: Math.round(data.y / SCALE),
        }));
    };

    const toggleLanguage = () => {
        setLang((prev) => (prev === "de" ? "en" : "de"));
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
            {/* SEITENLEISTE */}
            <div className="w-[400px] bg-slate-50 flex flex-col h-full border-r border-slate-200 z-10 shadow-lg shrink-0">
                <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Mail className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-800">
                                {t.appTitle}
                            </h1>
                            <p className="text-xs text-slate-500">
                                {t.appSubtitle}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors border border-slate-200"
                        title="Sprache wechseln / Change Language"
                    >
                        <Globe size={14} />
                        {lang === "de" ? "EN" : "DE"}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                            <Settings size={16} className="text-slate-400" />{" "}
                            {t.formatOrientation}
                        </label>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer mb-3"
                        >
                            {Object.keys(FORMATS).map((key) => (
                                <option key={key} value={key}>
                                    {t.formats[key]} ({FORMATS[key].width} ×{" "}
                                    {FORMATS[key].height} mm)
                                </option>
                            ))}
                        </select>

                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setIsLandscape(true)}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${isLandscape ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {t.landscape}
                            </button>
                            <button
                                onClick={() => setIsLandscape(false)}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!isLandscape ? "bg-white shadow-sm text-slate-800" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                {t.portrait}
                            </button>
                        </div>
                    </div>

                    <AddressCard
                        title={t.sender}
                        icon={User}
                        data={sender}
                        setData={setSender}
                        maxWidth={currentDims.width}
                        maxHeight={currentDims.height}
                        t={t}
                    />
                    <AddressCard
                        title={t.recipient}
                        icon={MapPin}
                        data={recipient}
                        setData={setRecipient}
                        maxWidth={currentDims.width}
                        maxHeight={currentDims.height}
                        t={t}
                    />
                </div>

                <div className="p-6 bg-white border-t border-slate-200 flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    >
                        <Printer size={20} />
                        {t.print}
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Download size={20} />
                        {t.export}
                    </button>
                </div>
            </div>

            {/* HAUPTBEREICH (Vorschau) */}
            <div className="flex-1 bg-grid-pattern overflow-auto relative flex items-center justify-center p-12">
                <div
                    className="relative bg-white shadow-2xl transition-all duration-300 ease-in-out border border-slate-200"
                    style={{
                        width: `${currentDims.width * SCALE}px`,
                        height: `${currentDims.height * SCALE}px`,
                    }}
                >
                    <div
                        className="absolute top-0 right-0 bg-red-50/50 border-l-2 border-b-2 border-dashed border-red-300 flex items-center justify-center text-red-400 text-xs font-bold pointer-events-none select-none"
                        style={{
                            width: `${currentDims.stamp.width * SCALE}px`,
                            height: `${currentDims.stamp.height * SCALE}px`,
                        }}
                    >
                        {t.frankZone}
                    </div>

                    {currentDims.window && (
                        <div
                            className="absolute bg-slate-100/50 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm font-bold pointer-events-none select-none rounded-sm"
                            style={{
                                top: `${currentDims.window.y * SCALE}px`,
                                left: `${currentDims.window.x * SCALE}px`,
                                width: `${currentDims.window.width * SCALE}px`,
                                height: `${currentDims.window.height * SCALE}px`,
                            }}
                        >
                            {t.windowZone}
                        </div>
                    )}

                    <Draggable
                        nodeRef={senderRef}
                        bounds="parent"
                        position={{
                            x: (Number(sender.x) || 0) * SCALE,
                            y: (Number(sender.y) || 0) * SCALE,
                        }}
                        onDrag={(e, data) => handleDrag(e, data, setSender)}
                    >
                        <div
                            ref={senderRef}
                            className="absolute cursor-move text-slate-600 whitespace-pre-wrap leading-snug p-1 border border-transparent hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm rounded transition-colors group z-10"
                            style={{
                                fontSize: `${sender.fontSize * PT_TO_PX}px`,
                                fontWeight: sender.isBold ? "bold" : "normal",
                                fontStyle: sender.isItalic
                                    ? "italic"
                                    : "normal",
                                fontFamily: getPreviewFontFamily(
                                    sender.fontFamily,
                                ),
                            }}
                        >
                            {sender.text || " "}
                        </div>
                    </Draggable>

                    <Draggable
                        nodeRef={recipientRef}
                        bounds="parent"
                        position={{
                            x: (Number(recipient.x) || 0) * SCALE,
                            y: (Number(recipient.y) || 0) * SCALE,
                        }}
                        onDrag={(e, data) => handleDrag(e, data, setRecipient)}
                    >
                        <div
                            ref={recipientRef}
                            className="absolute cursor-move text-slate-900 whitespace-pre-wrap leading-snug p-1 border border-transparent hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-sm rounded transition-colors z-10"
                            style={{
                                fontSize: `${recipient.fontSize * PT_TO_PX}px`,
                                fontWeight: recipient.isBold
                                    ? "bold"
                                    : "normal",
                                fontStyle: recipient.isItalic
                                    ? "italic"
                                    : "normal",
                                fontFamily: getPreviewFontFamily(
                                    recipient.fontFamily,
                                ),
                            }}
                        >
                            {recipient.text || " "}
                        </div>
                    </Draggable>
                </div>
            </div>
        </div>
    );
}
