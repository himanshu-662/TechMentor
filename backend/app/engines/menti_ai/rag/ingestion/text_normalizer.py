"""Text normalization module for Phase 16 RAG Knowledge Base.
Normalizes whitespace, line endings, and malformed characters while preserving
educational markdown structure (headings, code blocks, lists, and tables).
"""
import re


class TextNormalizer:
    """Cleans and standardizes raw parsed text for consistent chunking and embedding."""

    @staticmethod
    def normalize(text: str) -> str:
        """Normalize raw text while maintaining markdown semantics."""
        if not text:
            return ""

        # Standardize line endings
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # Strip null bytes and non-printable control characters except \t and \n
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)

        # Normalize unicode spaces to standard ASCII space
        text = re.sub(r'[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]', ' ', text)

        # Normalize repeated horizontal spaces (but preserve leading whitespace if in code blocks)
        lines = []
        in_code_block = False

        for line in text.splitlines():
            stripped = line.strip()
            if stripped.startswith("```"):
                in_code_block = not in_code_block
                lines.append(stripped)
                continue

            if in_code_block:
                lines.append(line)
            else:
                # Collapse multiple inline spaces to a single space
                clean_line = re.sub(r'[ \t]+', ' ', line).strip()
                lines.append(clean_line)

        # Recombine lines and collapse 3+ newlines down to 2
        joined = "\n".join(lines)
        joined = re.sub(r'\n{3,}', '\n\n', joined)

        return joined.strip()

    @staticmethod
    def sanitize_for_prompt_injection(text: str) -> str:
        """Neutralize malicious prompt injection markers that attempt to break LLM instructions."""
        if not text:
            return ""

        # Normalize casing markers for prompt hijacking patterns
        patterns = [
            (r'(?i)\bignore\s+(all\s+)?(previous|prior|above)\s+instructions\b', '[REDACTED_INJECTION_ATTEMPT]'),
            (r'(?i)\breveal\s+(the\s+)?(system\s+prompt|api\s+key|password|secret)\b', '[REDACTED_INJECTION_ATTEMPT]'),
            (r'(?i)\byou\s+are\s+now\s+in\s+DAN\s+mode\b', '[REDACTED_INJECTION_ATTEMPT]')
        ]

        sanitized = text
        for pat, replacement in patterns:
            sanitized = re.sub(pat, replacement, sanitized)

        return sanitized
