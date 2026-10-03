"""Document parsers for Phase 16 RAG Knowledge Base.
Supports Markdown, Plain Text, HTML, JSON, and PDF files.
"""
from abc import ABC, abstractmethod
import os
import json
import re
from html.parser import HTMLParser as PythonHTMLParser
from typing import Dict, Any, Optional, List, Tuple


class ParsedSection:
    """Represents a logical section extracted from a document."""
    def __init__(self, title: str, content: str, section_level: int = 1):
        self.title = title
        self.content = content
        self.section_level = section_level

    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "content": self.content,
            "section_level": self.section_level
        }


class DocumentParser(ABC):
    """Abstract base parser interface."""

    @abstractmethod
    def parse(self, content_bytes: bytes, filename: str = "") -> Tuple[str, List[ParsedSection]]:
        """Parse binary content and return (full_text, sections)."""
        pass


class MarkdownParser(DocumentParser):
    """Parses Markdown documents, extracting sections based on headers (#, ##, ###)."""

    def parse(self, content_bytes: bytes, filename: str = "") -> Tuple[str, List[ParsedSection]]:
        for enc in ("utf-8", "utf-8-sig", "latin-1"):
            try:
                text = content_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        else:
            text = content_bytes.decode("utf-8", errors="replace")

        lines = text.splitlines()
        sections: List[ParsedSection] = []
        current_title = "Overview"
        current_level = 1
        current_lines: List[str] = []

        header_pattern = re.compile(r'^(#{1,6})\s+(.+)$')

        for line in lines:
            match = header_pattern.match(line.strip())
            if match:
                # Check if current_lines has meaningful body text beyond just the header
                body_lines = [l for l in current_lines if not header_pattern.match(l.strip()) and l.strip()]
                if body_lines:
                    content_str = "\n".join(current_lines).strip()
                    if content_str:
                        sections.append(ParsedSection(current_title, content_str, current_level))
                current_lines = []

                hashes, title = match.groups()
                current_title = title.strip()
                current_level = len(hashes)
                current_lines.append(line)
            else:
                current_lines.append(line)

        if current_lines:
            content_str = "\n".join(current_lines).strip()
            if content_str:
                sections.append(ParsedSection(current_title, content_str, current_level))

        if not sections:
            sections.append(ParsedSection("General", text.strip(), 1))

        return text, sections


class TXTParser(DocumentParser):
    """Parses plain text documents, breaking on major blank line boundaries."""

    def parse(self, content_bytes: bytes, filename: str = "") -> Tuple[str, List[ParsedSection]]:
        for enc in ("utf-8", "utf-8-sig", "latin-1"):
            try:
                text = content_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        else:
            text = content_bytes.decode("utf-8", errors="replace")

        # Split on 2 or more newlines to identify paragraphs / logical blocks
        blocks = [b.strip() for b in re.split(r'\n\s*\n', text) if b.strip()]
        sections: List[ParsedSection] = []

        for i, block in enumerate(blocks):
            lines = block.splitlines()
            first_line = lines[0].strip() if lines else f"Section {i+1}"
            title = first_line[:60] if len(first_line) <= 60 else first_line[:57] + "..."
            sections.append(ParsedSection(title, block, 1))

        if not sections:
            sections.append(ParsedSection("General", text.strip(), 1))

        return text, sections


class _HTMLTextExtractor(PythonHTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed: List[str] = []
        self.ignore = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "head", "meta", "noscript"):
            self.ignore = True
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "li", "tr"):
            self.fed.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "head", "meta", "noscript"):
            self.ignore = False
        elif tag in ("h1", "h2", "h3", "h4", "h5", "h6", "p", "div", "li", "tr"):
            self.fed.append("\n")

    def handle_data(self, data):
        if not self.ignore:
            self.fed.append(data)

    def get_text(self) -> str:
        raw = "".join(self.fed)
        # Collapse multiple blank lines
        return re.sub(r'\n{3,}', '\n\n', raw).strip()


class HTMLParser(DocumentParser):
    """Parses HTML documents by stripping script/style tags and extracting plain text."""

    def parse(self, content_bytes: bytes, filename: str = "") -> Tuple[str, List[ParsedSection]]:
        for enc in ("utf-8", "utf-8-sig", "latin-1"):
            try:
                html_str = content_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        else:
            html_str = content_bytes.decode("utf-8", errors="replace")

        extractor = _HTMLTextExtractor()
        try:
            extractor.feed(html_str)
            text = extractor.get_text()
        except Exception:
            # Fallback regex strip
            text = re.sub(r'<[^>]+>', ' ', html_str)
            text = re.sub(r'\s+', ' ', text).strip()

        # Parse sections from headers if present, else paragraph chunks
        sections = [ParsedSection("HTML Document", text, 1)]
        return text, sections


class JSONParser(DocumentParser):
    """Parses JSON knowledge files (e.g. structured FAQ lists, concept dictionaries)."""

    def parse(self, content_bytes: bytes, filename: str = "") -> Tuple[str, List[ParsedSection]]:
        for enc in ("utf-8", "utf-8-sig"):
            try:
                raw_str = content_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        else:
            raw_str = content_bytes.decode("utf-8", errors="replace")

        data = json.loads(raw_str)
        sections: List[ParsedSection] = []
        full_text_parts: List[str] = []

        if isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, dict):
                    title = item.get("title") or item.get("topic") or item.get("question") or f"Item {i+1}"
                    body = item.get("content") or item.get("text") or item.get("answer") or json.dumps(item, indent=2)
                    sections.append(ParsedSection(str(title), str(body), 1))
                    full_text_parts.append(f"## {title}\n{body}")
                else:
                    item_str = str(item)
                    sections.append(ParsedSection(f"Item {i+1}", item_str, 1))
                    full_text_parts.append(item_str)
        elif isinstance(data, dict):
            for key, val in data.items():
                val_str = json.dumps(val, indent=2) if isinstance(val, (dict, list)) else str(val)
                sections.append(ParsedSection(str(key), val_str, 1))
                full_text_parts.append(f"## {key}\n{val_str}")
        else:
            text = str(data)
            sections.append(ParsedSection("JSON Data", text, 1))
            full_text_parts.append(text)

        full_text = "\n\n".join(full_text_parts)
        return full_text, sections


class PDFParser(DocumentParser):
    """Parses PDF documents using pypdf with page-by-page section extraction."""

    def parse(self, content_bytes: bytes, filename: str = "") -> Tuple[str, List[ParsedSection]]:
        sections: List[ParsedSection] = []
        page_texts: List[str] = []

        try:
            import io
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            for page_idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                clean_page = page_text.strip()
                if clean_page:
                    page_texts.append(clean_page)
                    sections.append(ParsedSection(f"Page {page_idx + 1}", clean_page, 1))
            text = "\n\n".join(page_texts)
        except Exception:
            # Fallback text extraction for stream byte objects if pypdf encountered an issue
            extracted_strings = re.findall(rb'\(([^\(\)]+)\)\s*T[jJ]', content_bytes)
            if extracted_strings:
                text = " ".join([s.decode('latin-1', errors='ignore') for s in extracted_strings])
            else:
                text = content_bytes.decode("latin-1", errors="ignore")
                text = re.sub(r'[^\x20-\x7E\n\r\t]', ' ', text)
                text = re.sub(r'\s+', ' ', text).strip()

        if not sections:
            sections = [ParsedSection("PDF Document", text.strip() if text else "Empty PDF", 1)]

        return text, sections


class ParserFactory:
    """Factory to retrieve the appropriate DocumentParser based on file extension."""

    @staticmethod
    def get_parser(filename: str) -> DocumentParser:
        ext = os.path.splitext(filename)[1].lower()
        if ext in {".md", ".markdown"}:
            return MarkdownParser()
        elif ext in {".txt"}:
            return TXTParser()
        elif ext in {".html", ".htm"}:
            return HTMLParser()
        elif ext in {".json"}:
            return JSONParser()
        elif ext in {".pdf"}:
            return PDFParser()
        else:
            # Default fallback to Markdown/Text parser
            return MarkdownParser()
