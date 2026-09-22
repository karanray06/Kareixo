"use server";

export async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch("https://api.github.com/repos/karanray06/Kareixo", {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.stargazers_count ?? null;
  } catch (error) {
    console.error("Failed to fetch GitHub stars:", error);
    return null;
  }
}
