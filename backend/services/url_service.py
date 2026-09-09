"""
Safe URL Media Fetcher Service for PULSEVEIN.

Validates URLs, prevents SSRF attacks (blocks localhost, 127.0.0.1, internal IP ranges),
enforces maximum file size limit (50MB), and streams media to a temporary file.
"""
import os
import re
import socket
import tempfile
import urllib.request
from urllib.parse import urlparse
from fastapi import HTTPException


DISALLOWED_HOSTS = {
    "localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"
}


def is_safe_url(url: str) -> bool:
    """Validates that URL is HTTP/HTTPS and does not target internal addresses."""
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        hostname = parsed.hostname
        if not hostname:
            return False
        if hostname.lower() in DISALLOWED_HOSTS:
            return False
        # Resolve IP to check private subnet
        ip = socket.gethostbyname(hostname)
        if ip.startswith("127.") or ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("172.16."):
            return False
        return True
    except Exception:
        return False


def fetch_media_from_url(url: str, max_bytes: int = 50 * 1024 * 1024) -> str:
    """
    Downloads media file from URL safely into a temporary file.
    Returns path to downloaded temp file.
    """
    if not is_safe_url(url):
        raise HTTPException(
            status_code=400,
            detail="Invalid or restricted URL. Only public HTTP/HTTPS URLs are supported.",
        )

    # Determine extension
    parsed = urlparse(url)
    ext = os.path.splitext(parsed.path)[1].lower()
    if ext not in (".mp4", ".webm", ".mov", ".avi", ".jpg", ".jpeg", ".png", ".webp"):
        ext = ".mp4"

    tmp = tempfile.NamedTemporaryFile(suffix=ext, delete=False)
    tmp_path = tmp.name
    tmp.close()

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "PULSEVEIN-Forensics/2.2.0 (Public Media Evaluator)"}
        )
        with urllib.request.urlopen(req, timeout=20) as response:
            content_length = response.getheader("Content-Length")
            if content_length and int(content_length) > max_bytes:
                raise HTTPException(status_code=413, detail=f"Remote file exceeds maximum allowed size ({max_bytes // (1024*1024)}MB).")

            downloaded = 0
            with open(tmp_path, "wb") as f:
                while True:
                    chunk = response.read(65536)
                    if not chunk:
                        break
                    downloaded += len(chunk)
                    if downloaded > max_bytes:
                        raise HTTPException(status_code=413, detail="Remote media stream exceeded size limit during download.")
                    f.write(chunk)

        return tmp_path
    except HTTPException:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise
    except Exception as exc:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
        raise HTTPException(status_code=400, detail=f"Failed to fetch media from URL: {str(exc)}")
