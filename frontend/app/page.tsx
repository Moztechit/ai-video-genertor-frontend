"use client";
import { useState } from "react";

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const [script, setScript] = useState("");
  const [voiceName, setVoiceName] = useState("en-US-AriaNeural"); // Free Edge TTS voice
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const projectId = crypto.randomUUID();

    // Change localhost to your live Render backend URL when deployed (e.g., https://your-app.onrender.com)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          script_text: script,
          voice_name: voiceName,
          image_url: imageUrl,
        }),
      });

      if (res.ok) {
        pollStatus(projectId, API_BASE_URL);
      } else {
        alert("Failed to start generation job.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Connection error to backend server.");
      setLoading(false);
    }
  };

  const pollStatus = (id: string, baseUrl: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${baseUrl}/api/status/${id}`);
        const data = await res.json();
        setStatusData(data);

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        clearInterval(interval);
        setLoading(false);
      }
    }, 3000);
  };

  return (
    <main className="max-w-2xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">AI Talking Avatar Studio</h1>
      <p className="text-sm text-gray-500 mb-6">Powered by Edge TTS, Fal.ai, and Replicate (No Credit Card Required)</p>
      
      <form onSubmit={handleGenerate} className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">Portrait Image Public URL</label>
          <input 
            type="text" 
            placeholder="https://images.unsplash.com/..." 
            value={imageUrl} 
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required 
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">Script Text</label>
          <textarea 
            rows={4}
            placeholder="What should the avatar say?" 
            value={script} 
            onChange={(e) => setScript(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required 
          />
        </div>

        <div>
          <label className="block font-medium text-sm text-gray-700 mb-1">Voice Name (Edge TTS)</label>
          <input 
            type="text" 
            value={voiceName} 
            onChange={(e) => setVoiceName(e.target.value)}
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            required 
          />
          <p className="text-xs text-gray-400 mt-1">Examples: en-US-AriaNeural, en-US-ChristopherNeural, en-GB-SoniaNeural</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Processing Pipeline..." : "Generate Video"}
        </button>
      </form>

      {statusData && (
        <div className="mt-6 p-4 bg-gray-50 border rounded-xl">
          <p className="font-semibold">Status: <span className="text-blue-600">{statusData.status}</span></p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${statusData.progress}%` }}></div>
          </div>
          
          {statusData.status === "COMPLETED" && statusData.final_video_url && (
            <div className="mt-4">
              <p className="font-medium mb-2">Final Output Video:</p>
              <video src={statusData.final_video_url} controls className="w-full rounded-lg shadow" />
            </div>
          )}

          {statusData.status === "FAILED" && (
            <p className="mt-2 text-red-600 text-sm">Error: {statusData.error}</p>
          )}
        </div>
      )}
    </main>
  );
}
