# fact_checker.py
"""
Personalized Networking Assistant - Wikipedia Fact-Checking Service
Fetches verified summarized answers directly from Wikipedia API wrappers.
"""

import urllib.parse
import json

try:
    import httpx
except ImportError:
    # Fallback to standard library urllib if httpx is not installed
    httpx = None

class FactCheckerService:
    def verify_fact(self, query: str) -> dict:
        """
        Queries Wikipedia API to fetch a verified summary for a technological/professional term.
        """
        if not query:
            return {"found": False, "message": "Search query is empty."}

        # Clean search query
        query_clean = query.strip()

        try:
            # 1. Search Wikipedia for best-matching page
            search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query_clean)}&format=json&origin=*"
            
            if httpx:
                response = httpx.get(search_url)
                search_data = response.json()
            else:
                import urllib.request
                with urllib.request.urlopen(search_url) as resp:
                    search_data = json.loads(resp.read().decode())

            search_results = search_data.get("query", {}).get("search", [])

            if not search_results:
                return {
                    "found": False,
                    "message": f"No verified Wikipedia pages found for '{query_clean}'."
                }

            # 2. Retrieve page summary for the first best match
            best_title = search_results[0]["title"]
            title_slug = best_title.replace(" ", "_")
            summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title_slug)}"

            if httpx:
                sum_resp = httpx.get(summary_url)
                summary_data = sum_resp.json()
            else:
                with urllib.request.urlopen(summary_url) as resp:
                    summary_data = json.loads(resp.read().decode())

            if "extract" in summary_data:
                return {
                    "found": True,
                    "title": summary_data.get("title", best_title),
                    "summary": summary_data.get("extract"),
                    "url": summary_data.get("content_urls", {}).get("desktop", {}).get("page", f"https://en.wikipedia.org/wiki/{title_slug}"),
                    "thumbnail": summary_data.get("thumbnail", {}).get("source", None)
                }
            else:
                # Fallback to search result snippet if page summary API is unavailable
                clean_snippet = search_results[0]["snippet"].replace('<span class="searchmatch">', '').replace('</span>', '')
                return {
                    "found": True,
                    "title": best_title,
                    "summary": clean_snippet,
                    "url": f"https://en.wikipedia.org/wiki/{title_slug}",
                    "thumbnail": None
                }

        except Exception as e:
            return {
                "found": False,
                "message": f"Wikipedia query error: {str(e)}"
            }
