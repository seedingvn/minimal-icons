"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  ArrowDownAZ,
  ArrowUpAZ,
  Palette,
  Sun,
  Moon,
  Download,
  X,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

// Khai báo kiểu dữ liệu cho Icon để code an toàn hơn
interface Icon {
  slug: string;
  name: string;
  color: string;
  svgContent: string;
}

const ICONS_PER_PAGE = 60;

// Component chính để hiển thị toàn bộ giao diện
export default function IconGrid({ icons }: { icons: Icon[] }) {
  // Navigation hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // States
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [visibleCount, setVisibleCount] = useState(ICONS_PER_PAGE);
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [copiedInfo, setCopiedInfo] = useState<{ slug: string; type: 'svg' | 'color' } | null>(null);

  const [sortBy, setSortBy] = useState("az");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [theme, setTheme] = useState("light");

  // Đồng bộ searchTerm với URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 300); // Debounce 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, pathname, router, searchParams]);

  // Logic cho Dark Mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Logic lọc và sắp xếp
  const filteredIcons = useMemo(
    () =>
      icons.filter((icon) =>
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [icons, searchTerm]
  );

  const sortedIcons = useMemo(() => {
    const newSortedIcons = [...filteredIcons];
    switch (sortBy) {
      case "az":
        newSortedIcons.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "color":
        newSortedIcons.sort((a, b) => a.color.localeCompare(b.color));
        break;
      case "random":
        return newSortedIcons.sort(() => Math.random() - 0.5);
    }
    if (sortOrder === "desc") {
      newSortedIcons.reverse();
    }
    return newSortedIcons;
  }, [filteredIcons, sortBy, sortOrder]);

  // Logic "cuộn để tải thêm"
  const displayedIcons = sortedIcons.slice(0, visibleCount);

  const handleSortChange = (newSortBy: string) => {
    if (!newSortBy) return;
    if (sortBy === newSortBy) {
      setSortOrder((currentOrder) => (currentOrder === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 400 &&
      visibleCount < sortedIcons.length
    ) {
      setVisibleCount((prevCount) => prevCount + ICONS_PER_PAGE);
    }
  }, [visibleCount, sortedIcons.length]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setVisibleCount(ICONS_PER_PAGE);
  }, [searchTerm, sortBy, sortOrder]);

  const handleDownload = (icon: Icon, format: "SVG" | "PNG") => {
    const filename = icon.slug;
    const svgContent = icon.svgContent;
    if (format === "SVG") {
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === "PNG") {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.onload = () => {
        canvas.width = 256;
        canvas.height = 256;
        ctx.drawImage(img, 0, 0, 256, 256);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${filename}.png`;
        a.click();
      };
      img.src =
        "data:image/svg+xml;base64," +
        btoa(unescape(encodeURIComponent(svgContent)));
    }
  };

  const handleCopy = (text: string, slug: string, type: 'svg' | 'color') => {
    navigator.clipboard.writeText(text);
    setCopiedInfo({ slug, type });
    setTimeout(() => {
      setCopiedInfo(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col mb-8 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold">Minimal Icons</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Over 3,300+ SVG icons for popular brands
            </p>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-white dark:bg-slate-800 dark:border-slate-700"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-slate-800"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <div className="flex items-center gap-1">
                <Button variant={sortBy === "az" ? "default" : "outline"} size="icon" onClick={() => handleSortChange("az")}>
                  {sortBy === "az" && sortOrder === "asc" ? ( <ArrowDownAZ className="h-4 w-4" />) : sortBy === "az" && sortOrder === "desc" ? ( <ArrowUpAZ className="h-4 w-4" />) : (<ArrowDownAZ className="h-4 w-4" />)}
                </Button>
                <Button variant={sortBy === "color" ? "default" : "outline"} size="icon" onClick={() => handleSortChange("color")}>
                  <Palette className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <ToggleGroup type="single" defaultValue={theme} onValueChange={(value) => value && setTheme(value)} variant="outline">
                <ToggleGroupItem value="light" className="data-[state=on]:bg-slate-900 data-[state=on]:text-slate-50 dark:data-[state=on]:bg-slate-200 dark:data-[state=on]:text-slate-900"><Sun className="h-4 w-4" /></ToggleGroupItem>
                <ToggleGroupItem value="dark" className="data-[state=on]:bg-slate-900 data-[state=on]:text-slate-50 dark:data-[state=on]:bg-slate-200 dark:data-[state=on]:text-slate-900"><Moon className="h-4 w-4" /></ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        <main className="mb-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayedIcons.map((icon) => (
              <IconCard
                key={icon.slug}
                icon={icon}
                isSvgCopied={copiedInfo?.slug === icon.slug && copiedInfo?.type === "svg"}
                isColorCopied={copiedInfo?.slug === icon.slug && copiedInfo?.type === "color"}
                onQuickView={() => setSelectedIcon(icon)}
                onCopyColor={() => handleCopy(icon.color, icon.slug, "color")}
                onCopySvg={() => handleCopy(icon.svgContent, icon.slug, "svg")}
                onDownloadSvg={() => handleDownload(icon, "SVG")}
              />
            ))}
          </div>
        </main>

        <footer className="w-full mt-auto py-8 border-t border-slate-200 dark:border-slate-800">
          <div className="container mx-auto text-center text-sm text-slate-500 dark:text-slate-400 space-y-2">
            <p>For advertising partnerships or contributions, please contact us via email: <a href="mailto:support@minimalicons.store" className="font-medium underline">support@minimalicons.store</a></p>
          </div>
        </footer>
      </div>

      <Dialog open={!!selectedIcon} onOpenChange={(isOpen) => !isOpen && setSelectedIcon(null)}>
        <DialogContent className="max-w-4xl dark:bg-slate-900 p-0">
          {selectedIcon && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-800 sm:rounded-l-lg">
                <div className="w-40 h-40 flex items-center justify-center text-black dark:[&_svg]:fill-white" dangerouslySetInnerHTML={{ __html: selectedIcon.svgContent }}/>
                <DialogTitle className={`font-bold mt-4 text-center ${selectedIcon.name.length > 13 ? 'text-xl' : 'text-2xl'}`}>
                  {selectedIcon.name}
                </DialogTitle>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="space-y-2 flex flex-col items-start">
                  <Button variant="ghost" className="w-full justify-start text-base" onClick={() => handleDownload(selectedIcon, "SVG")}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download SVG
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-base" onClick={() => handleDownload(selectedIcon, "PNG")}>
                    <Download className="mr-2 h-4 w-4"/>
                    Download PNG
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-base" onClick={() => handleCopy(selectedIcon.svgContent, selectedIcon.slug, 'svg')}>
                    { (copiedInfo?.slug === selectedIcon.slug && copiedInfo?.type === 'svg') ? <Check className="mr-2 h-4 w-4 text-green-500"/> : <Copy className="mr-2 h-4 w-4"/>}
                    Copy SVG
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-base" onClick={() => handleCopy(selectedIcon.color, selectedIcon.slug, 'color')}>
                    { (copiedInfo?.slug === selectedIcon.slug && copiedInfo?.type === 'color') ? <Check className="mr-2 h-4 w-4 text-green-500"/> : <Copy className="mr-2 h-4 w-4"/>}
                    Copy hex color
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}


function IconCard({
  icon,
  onQuickView,
  onCopyColor,
  onCopySvg,
  onDownloadSvg,
  isColorCopied,
  isSvgCopied,
}: {
  icon: Icon;
  onQuickView: () => void;
  onCopyColor: () => void;
  onCopySvg: () => void;
  onDownloadSvg: () => void;
  isColorCopied: boolean;
  isSvgCopied: boolean;
}) {
  return (
    <Card className="group bg-white dark:bg-slate-800/50 hover:shadow-lg dark:hover:bg-slate-800 transition-shadow duration-200 overflow-hidden flex flex-col">
      <div
        className="p-3 flex-grow flex flex-col items-center justify-center text-center space-y-1 cursor-pointer relative group/main"
        onClick={onQuickView}
      >
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/main:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            onCopySvg();
          }}
        >
          <div className="p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full shadow-lg">
            {isSvgCopied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </div>
        </div>
        <div
          className="w-16 h-16 flex items-center justify-center text-black dark:[&_svg]:fill-white transition-opacity group-hover/main:opacity-30"
          dangerouslySetInnerHTML={{ __html: icon.svgContent }}
        />
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm h-10 flex items-center text-center justify-center transition-opacity group-hover/main:opacity-30">
          {icon.name}
        </h3>
      </div>
      <div
        className="group/action-bar w-full px-3 py-2 flex items-center justify-between text-white font-mono text-xs cursor-pointer mt-auto flex-shrink-0"
        style={{ backgroundColor: icon.color }}
        onClick={onCopyColor}
      >
        <div className="relative h-5 flex items-center">
          <span className="opacity-100 transition-opacity group-hover/action-bar:opacity-0">
            {icon.color}
          </span>
          <div className="absolute inset-0 flex items-center justify-start opacity-0 transition-opacity group-hover/action-bar:opacity-100">
            {isColorCopied ? (
              <Check className="h-4 w-4 text-white" />
            ) : (
              <Copy className="h-4 w-4 text-white" />
            )}
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadSvg();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}