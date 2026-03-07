import { jsPDF } from "jspdf";
import {
    Download,
    Globe,
    Hand,
    Mail,
    MapPin,
    Minus,
    Move,
    Plus,
    Printer,
    RotateCcw,
    Settings,
    ShieldCheck,
    Stamp,
    Type,
    User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import packageJson from "../package.json";

const TRANSLATIONS = {
    de: {
        appTitle: "Briefumschlag Druck",
        appSubtitle: "PDF Generator & Designer",
        formatSettings: "Format-Auswahl",
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
        returnLine: "Als Zeile über Empfänger",
        reset: "Reset",
        dragHint: "Adressen zum Verschieben ziehen",
        privacyNote:
            "Datenschutz: Keine Server-Speicherung.\nDaten verbleiben lokal in Ihrem Browser.",
        formats: {
            "DIN A4 (Briefbogen)": "DIN A4 (Briefbogen)",
            "DIN Lang (mit Fenster)": "DIN Lang (mit Fenster)",
            "DIN Lang (ohne Fenster)": "DIN Lang (ohne Fenster)",
            "C4 (mit Fenster)": "C4 (mit Fenster)",
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
        formatSettings: "Format Selection",
        sender: "Sender",
        recipient: "Recipient",
        placeholder: "John Doe\n123 Main Street\nNew York, NY 10001\nUSA",
        bold: "Bold",
        italic: "Italic",
        print: "Print",
        export: "Export",
        frankZone: "Postage",
        windowZone: "Window",
        returnLine: "As line above recipient",
        reset: "Reset",
        dragHint: "Drag addresses to reposition",
        privacyNote:
            "Privacy: No server storage.\nAll data stays local in your browser.",
        formats: {
            "DIN A4 (Briefbogen)": "DIN A4 (Letterhead)",
            "DIN Lang (mit Fenster)": "DIN Lang (with Window)",
            "DIN Lang (ohne Fenster)": "DIN Lang (no Window)",
            "C4 (mit Fenster)": "C4 (with Window)",
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

// Fest an Norm gekoppelte Maße und Ausrichtungen
const FORMATS = {
    "DIN A4 (Briefbogen)": {
        width: 210,
        height: 297,
        orientation: "portrait",
        window: { x: 20, y: 45, width: 90, height: 45 },
        stamp: null,
    },
    "DIN Lang (mit Fenster)": {
        width: 220,
        height: 110,
        orientation: "landscape",
        window: { x: 20, y: 45, width: 90, height: 45 },
        stamp: { width: 74, height: 40 },
    },
    "DIN Lang (ohne Fenster)": {
        width: 220,
        height: 110,
        orientation: "landscape",
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "C4 (mit Fenster)": {
        width: 229,
        height: 324,
        orientation: "portrait",
        window: { x: 20, y: 45, width: 90, height: 45 },
        stamp: { width: 74, height: 40 },
    },
    "C4 (Großbrief)": {
        width: 229,
        height: 324,
        orientation: "portrait",
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "C5 (Kompaktbrief)": {
        width: 229,
        height: 162,
        orientation: "landscape",
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "C6 (Standardbrief)": {
        width: 162,
        height: 114,
        orientation: "landscape",
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "B4 (Großformat)": {
        width: 250,
        height: 353,
        orientation: "portrait",
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "B5 (Zwischenformat)": {
        width: 250,
        height: 176,
        orientation: "landscape",
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "Quadratisch (155 x 155)": {
        width: 155,
        height: 155,
        orientation: "portrait",
        window: null,
        stamp: { width: 74, height: 40 },
    },
    "Quadratisch Groß (220 x 220)": {
        width: 220,
        height: 220,
        orientation: "portrait",
        window: null,
        stamp: { width: 74, height: 40 },
    },
};

const PT_TO_MM = 25.4 / 72;

const clampCoordinate = (val, text, fontSize, maxW, maxH, isX) => {
    if (val === "" || val === null || val === undefined) return "";
    let num = Number(val);
    if (num < 0) num = 0;

    const safeText = text || " ";
    if (isX) {
        const maxChars = Math.max(...safeText.split("\n").map((l) => l.length));
        const approxWidth = maxChars * fontSize * 0.22;
        const safeMaxX = Math.max(0, maxW - approxWidth - 5);
        if (num > safeMaxX) num = Math.floor(safeMaxX);
    } else {
        const linesCount = safeText.split("\n").length;
        const approxHeight = linesCount * fontSize * 0.45;
        const safeMaxY = Math.max(0, maxH - approxHeight - 5);
        if (num > safeMaxY) num = Math.floor(safeMaxY);
    }
    return num;
};

const AddressCard = ({
    title,
    icon: Icon,
    data,
    setData,
    maxWidth,
    maxHeight,
    t,
    isSender,
}) => {
    const isDisabled = isSender && data.useAsReturnLine;

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold">
                <Icon size={18} className="text-blue-500" />
                <h3>{title}</h3>
            </div>
            <textarea
                value={data.text}
                onChange={(e) => {
                    const newText = e.target.value;
                    const newX = clampCoordinate(
                        data.x,
                        newText,
                        data.fontSize,
                        maxWidth,
                        maxHeight,
                        true,
                    );
                    const newY = clampCoordinate(
                        data.y,
                        newText,
                        data.fontSize,
                        maxWidth,
                        maxHeight,
                        false,
                    );
                    setData({ ...data, text: newText, x: newX, y: newY });
                }}
                className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none mb-4"
                placeholder={t.placeholder}
            />
            <div
                className={`grid grid-cols-2 gap-4 mb-4 ${isDisabled ? "opacity-40 grayscale" : ""}`}
            >
                <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
                        <Move size={12} /> X (mm)
                    </label>
                    <input
                        disabled={isDisabled}
                        type="number"
                        value={data.x}
                        onChange={(e) => {
                            const val = clampCoordinate(
                                e.target.value,
                                data.text,
                                data.fontSize,
                                maxWidth,
                                maxHeight,
                                true,
                            );
                            setData({ ...data, x: val });
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
                        <Move size={12} className="rotate-90" /> Y (mm)
                    </label>
                    <input
                        disabled={isDisabled}
                        type="number"
                        value={data.y}
                        onChange={(e) => {
                            const val = clampCoordinate(
                                e.target.value,
                                data.text,
                                data.fontSize,
                                maxWidth,
                                maxHeight,
                                false,
                            );
                            setData({ ...data, y: val });
                        }}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <div
                    className={`flex items-center gap-2 w-full ${isDisabled ? "opacity-40 grayscale" : ""}`}
                >
                    <Type size={14} className="text-slate-400 shrink-0" />
                    <select
                        disabled={isDisabled}
                        value={data.fontFamily || "helvetica"}
                        onChange={(e) =>
                            setData({ ...data, fontFamily: e.target.value })
                        }
                        className="flex-1 p-1.5 bg-white border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <option value="helvetica">Helvetica</option>
                        <option value="times">Times (Serif)</option>
                        <option value="courier">Courier (Mono)</option>
                    </select>
                    <div className="flex items-center gap-1">
                        <input
                            disabled={isDisabled}
                            type="number"
                            value={data.fontSize}
                            onChange={(e) => {
                                const newFontSize = Number(e.target.value);
                                const newX = clampCoordinate(
                                    data.x,
                                    data.text,
                                    newFontSize,
                                    maxWidth,
                                    maxHeight,
                                    true,
                                );
                                const newY = clampCoordinate(
                                    data.y,
                                    data.text,
                                    newFontSize,
                                    maxWidth,
                                    maxHeight,
                                    false,
                                );
                                setData({
                                    ...data,
                                    fontSize: newFontSize,
                                    x: newX,
                                    y: newY,
                                });
                            }}
                            className="w-[72px] p-1.5 text-center border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
                        />
                        <span className="text-xs text-slate-500">pt</span>
                    </div>
                </div>
                <div
                    className={`flex items-center gap-4 ${isDisabled ? "opacity-40 grayscale" : ""}`}
                >
                    <label
                        className={`flex items-center gap-1.5 text-sm select-none ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <input
                            disabled={isDisabled}
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
                    <label
                        className={`flex items-center gap-1.5 text-sm select-none ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        <input
                            disabled={isDisabled}
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
                {isSender && (
                    <div className="pt-2 mt-1 border-t border-slate-100">
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.useAsReturnLine || false}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        useAsReturnLine: e.target.checked,
                                    })
                                }
                                className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                            />
                            <span className="text-slate-700 font-medium">
                                {t.returnLine}
                            </span>
                        </label>
                    </div>
                )}
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
        const savedLang = localStorage.getItem("envelopeLang");
        if (savedLang) return savedLang;

        const browserLang =
            typeof window !== "undefined" &&
            (navigator.language || navigator.userLanguage || "");
        return browserLang.toLowerCase().startsWith("de") ? "de" : "en";
    });
    const t = TRANSLATIONS[lang];

    const [zoom, setZoom] = useState(() => {
        const savedZoom = localStorage.getItem("envelopeZoom");
        return savedZoom ? Number(savedZoom) : 3;
    });

    const [showDragHint, setShowDragHint] = useState(true);

    const [format, setFormat] = useState(() => {
        const savedFormat = localStorage.getItem("envelopeFormat");
        const parsed = savedFormat
            ? JSON.parse(savedFormat)
            : "DIN Lang (ohne Fenster)";
        return FORMATS[parsed] ? parsed : "DIN Lang (ohne Fenster)";
    });

    const [sender, setSender] = useState(() => {
        const savedSender = localStorage.getItem("envelopeSender");
        if (savedSender) {
            const parsed = JSON.parse(savedSender);
            return {
                fontFamily: "helvetica",
                useAsReturnLine: false,
                ...parsed,
            };
        }
        return {
            text: "",
            x: 10,
            y: 10,
            fontSize: 10,
            isBold: false,
            isItalic: false,
            fontFamily: "helvetica",
            useAsReturnLine: false,
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

    useEffect(() => {
        const timer = setTimeout(() => setShowDragHint(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => localStorage.setItem("envelopeLang", lang), [lang]);
    useEffect(() => localStorage.setItem("envelopeZoom", zoom), [zoom]);
    useEffect(
        () => localStorage.setItem("envelopeFormat", JSON.stringify(format)),
        [format],
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

    const currentDims = FORMATS[format];

    const isOutOfBounds = (data) => {
        return (
            data.x <= 0 ||
            data.y <= 0 ||
            data.x >= currentDims.width - 5 ||
            data.y >= currentDims.height - 5
        );
    };

    useEffect(() => {
        const checkBounds = (prev) => {
            const newX = clampCoordinate(
                prev.x,
                prev.text,
                prev.fontSize,
                currentDims.width,
                currentDims.height,
                true,
            );
            const newY = clampCoordinate(
                prev.y,
                prev.text,
                prev.fontSize,
                currentDims.width,
                currentDims.height,
                false,
            );

            const finalX = newX === "" ? 0 : newX;
            const finalY = newY === "" ? 0 : newY;

            if (finalX !== prev.x || finalY !== prev.y) {
                return { ...prev, x: finalX, y: finalY };
            }
            return prev;
        };

        setSender((prev) => checkBounds(prev));
        setRecipient((prev) => checkBounds(prev));
    }, [currentDims.width, currentDims.height]);

    const handleReset = () => {
        if (
            window.confirm(
                lang === "de"
                    ? "Alle Einstellungen wirklich zurücksetzen?"
                    : "Really reset all settings?",
            )
        ) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleZoom = (delta) => {
        setZoom(
            (prev) =>
                Math.round(Math.max(1, Math.min(6, prev + delta)) * 10) / 10,
        );
    };

    const handleDragStop = (e, data, setter) => {
        setShowDragHint(false);
        setter((prev) => ({
            ...prev,
            x: Math.round(data.x / zoom),
            y: Math.round(data.y / zoom),
        }));
    };

    const getSingleLineSender = () =>
        sender.text
            .split("\n")
            .filter((line) => line.trim() !== "")
            .join(" • ");

    const createPDF = () => {
        const doc = new jsPDF({
            orientation: currentDims.orientation,
            unit: "mm",
            format: [currentDims.width, currentDims.height],
        });

        if (sender.text && !sender.useAsReturnLine) {
            doc.setFontSize(sender.fontSize);
            doc.setFont(
                sender.fontFamily || "helvetica",
                sender.isBold && sender.isItalic
                    ? "bolditalic"
                    : sender.isBold
                      ? "bold"
                      : sender.isItalic
                        ? "italic"
                        : "normal",
            );
            doc.text(
                sender.text.split("\n"),
                Number(sender.x) || 0,
                Number(sender.y) || 0,
            );
        }
        if (recipient.text) {
            const rx = Number(recipient.x) || 0;
            const ry = Number(recipient.y) || 0;
            doc.setFontSize(recipient.fontSize);
            doc.setFont(
                recipient.fontFamily || "helvetica",
                recipient.isBold && recipient.isItalic
                    ? "bolditalic"
                    : recipient.isBold
                      ? "bold"
                      : recipient.isItalic
                        ? "italic"
                        : "normal",
            );
            doc.text(recipient.text.split("\n"), rx, ry);
            if (sender.useAsReturnLine && sender.text) {
                doc.setFontSize(8);
                doc.setFont(recipient.fontFamily || "helvetica", "normal");
                const returnLineText = getSingleLineSender();
                doc.text(returnLineText, rx, ry - 4);
                const textWidth = doc.getTextWidth(returnLineText);
                doc.setLineWidth(0.1);
                doc.line(rx, ry - 3.5, rx + textWidth, ry - 3.5);
            }
        }
        return doc;
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans overflow-hidden relative">
            <div className="w-[26rem] bg-slate-50 flex flex-col h-full border-r border-slate-200 z-10 shadow-lg shrink-0">
                <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Mail className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-800 shrink-0">
                                {t.appTitle}
                            </h1>
                            <p className="text-xs text-slate-500">
                                {t.appSubtitle}
                                <span className="bg-slate-200/70 text-slate-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wider">
                                    v{packageJson.version}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleReset}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title={t.reset}
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button
                            onClick={() => setLang(lang === "de" ? "en" : "de")}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-blue-600 bg-slate-100 px-2 rounded-md transition-all border border-slate-200"
                        >
                            <Globe size={14} />
                            {lang.toUpperCase()}
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                            <Settings size={16} className="text-slate-400" />{" "}
                            {t.formatSettings}
                        </label>
                        <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                        >
                            {Object.keys(FORMATS).map((key) => (
                                <option key={key} value={key}>
                                    {t.formats[key]} ({FORMATS[key].width} ×{" "}
                                    {FORMATS[key].height} mm)
                                </option>
                            ))}
                        </select>
                    </div>
                    <AddressCard
                        title={t.sender}
                        icon={User}
                        data={sender}
                        setData={setSender}
                        maxWidth={currentDims.width}
                        maxHeight={currentDims.height}
                        t={t}
                        isSender={true}
                    />
                    <AddressCard
                        title={t.recipient}
                        icon={MapPin}
                        data={recipient}
                        setData={setRecipient}
                        maxWidth={currentDims.width}
                        maxHeight={currentDims.height}
                        t={t}
                        isSender={false}
                    />

                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 items-start">
                        <ShieldCheck
                            className="text-blue-500 shrink-0 mt-0.5"
                            size={16}
                        />
                        <p className="text-[12px] leading-relaxed text-slate-500 italic whitespace-pre-line">
                            {t.privacyNote}
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-white border-t border-slate-200 space-y-4">
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                const doc = createPDF();
                                doc.autoPrint();
                                window.open(doc.output("bloburl"), "_blank");
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors shadow-md"
                        >
                            <Printer size={20} />
                            {t.print}
                        </button>
                        <button
                            onClick={() =>
                                createPDF().save(
                                    `Envelope_${format.replace(/ /g, "_")}.pdf`,
                                )
                            }
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors shadow-md"
                        >
                            <Download size={20} />
                            {t.export}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-grid-pattern overflow-auto relative flex items-center justify-center p-12">
                {showDragHint && (
                    <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[60] animate-bounce pointer-events-none">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-sm font-bold border-2 border-white/50">
                            <Hand size={18} /> {t.dragHint}
                        </div>
                    </div>
                )}

                <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-2xl z-50">
                    <button
                        onClick={() => handleZoom(-0.5)}
                        className="p-2 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-90"
                        title="Zoom Out"
                    >
                        <Minus size={18} strokeWidth={3} />
                    </button>
                    <div className="w-20 text-center border-x border-slate-200 px-2">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter leading-none mb-1">
                            Zoom
                        </div>
                        <div className="text-sm font-black text-slate-800 leading-none">
                            {((zoom / 3) * 100).toFixed(0)}%
                        </div>
                    </div>
                    <button
                        onClick={() => handleZoom(0.5)}
                        className="p-2 text-slate-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-90"
                        title="Zoom In"
                    >
                        <Plus size={18} strokeWidth={3} />
                    </button>
                </div>

                <div
                    className="relative bg-white shadow-2xl border border-slate-200 transition-all duration-300"
                    style={{
                        width: `${currentDims.width * zoom}px`,
                        height: `${currentDims.height * zoom}px`,
                    }}
                >
                    {currentDims.stamp && (
                        <div
                            className="absolute top-0 right-0 bg-red-50/50 border-l border-b border-dashed border-red-200 flex flex-col items-center justify-center text-red-300 pointer-events-none select-none"
                            style={{
                                width: `${currentDims.stamp.width * zoom}px`,
                                height: `${currentDims.stamp.height * zoom}px`,
                            }}
                        >
                            <Stamp size={zoom * 8} className="mb-1" />
                            <span
                                className="font-bold uppercase tracking-wider"
                                style={{ fontSize: `${zoom * 3}px` }}
                            >
                                {t.frankZone}
                            </span>
                        </div>
                    )}

                    {currentDims.window && (
                        <div
                            className="absolute bg-slate-100/30 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 font-bold pointer-events-none select-none rounded-sm"
                            style={{
                                top: `${currentDims.window.y * zoom}px`,
                                left: `${currentDims.window.x * zoom}px`,
                                width: `${currentDims.window.width * zoom}px`,
                                height: `${currentDims.window.height * zoom}px`,
                                fontSize: `${zoom * 4}px`,
                            }}
                        >
                            {t.windowZone}
                        </div>
                    )}

                    {!sender.useAsReturnLine && (
                        <Draggable
                            bounds="parent"
                            nodeRef={senderRef}
                            position={{
                                x: (Number(sender.x) || 0) * zoom,
                                y: (Number(sender.y) || 0) * zoom,
                            }}
                            onStop={(e, data) =>
                                handleDragStop(e, data, setSender)
                            }
                        >
                            <div
                                ref={senderRef}
                                className={`absolute cursor-grab active:cursor-grabbing text-slate-600 whitespace-pre-wrap leading-snug p-1 border-2 rounded z-10 transition-colors ${isOutOfBounds(sender) ? "border-red-500 bg-red-50/30" : "border-transparent hover:border-blue-400 hover:bg-blue-50/50 shadow-sm"}`}
                                style={{
                                    fontSize: `${sender.fontSize * PT_TO_MM * zoom}px`,
                                    fontWeight: sender.isBold
                                        ? "bold"
                                        : "normal",
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
                    )}

                    <Draggable
                        bounds="parent"
                        nodeRef={recipientRef}
                        position={{
                            x: (Number(recipient.x) || 0) * zoom,
                            y: (Number(recipient.y) || 0) * zoom,
                        }}
                        onStop={(e, data) =>
                            handleDragStop(e, data, setRecipient)
                        }
                    >
                        <div
                            ref={recipientRef}
                            className={`absolute cursor-grab active:cursor-grabbing text-slate-900 whitespace-pre-wrap leading-snug p-1 border-2 rounded z-10 transition-colors ${isOutOfBounds(recipient) ? "border-red-500 bg-red-50/30" : "border-transparent hover:border-blue-400 hover:bg-blue-50/50 shadow-sm"}`}
                            style={{
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
                            {sender.useAsReturnLine && sender.text && (
                                <div
                                    style={{
                                        fontSize: `${8 * PT_TO_MM * zoom}px`,
                                        fontWeight: "normal",
                                        fontStyle: "normal",
                                        marginBottom: `${2 * zoom}px`,
                                        borderBottom: "1px solid currentColor",
                                        display: "inline-block",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {getSingleLineSender()}
                                </div>
                            )}
                            <div
                                style={{
                                    fontSize: `${recipient.fontSize * PT_TO_MM * zoom}px`,
                                }}
                            >
                                {recipient.text || " "}
                            </div>
                        </div>
                    </Draggable>
                </div>
            </div>
        </div>
    );
}
