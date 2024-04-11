export default function Hero() {
  return (
    <div className="p-5 mx-auto max-w-6xl text-center">
      <h1 className="text-5xl font-bold from-purple-100 bg-gradient-to-b to-purple-400 text-transparent bg-clip-text inline-block p-3">
        Finetune your embeddings
      </h1>
      <p className="text-2xl text-slate-200 mt-2">
        Boost your OpenAI embeddings with a{" "}
        <span className="font-medium text-slate-100">simple matmul</span>
        {" trained "}
        <span className="font-medium text-slate-100">in your browser</span>
      </p>
      <div className="mx-auto py-3 px-4 mt-5 text-left text-sm bg-slate-900 rounded-md border border-slate-500 font-mono inline-block">
        <span className="block">
          <span className="text-yellow-300">M</span> ={" "}
          <span className="text-blue-300">np.load</span>(
          <span className="text-red-300">"spaceshifted.npy"</span>)
        </span>
        <span className="block">
          <span className="text-yellow-300">u</span> ={" "}
          <span className="text-blue-300">get_embedding</span>(
          <span className="text-red-300">"What's the capital of Peru?"</span>)
        </span>
        <span className="block">
          <span className="text-yellow-300">v</span> ={" "}
          <span className="text-blue-300">get_embedding</span>(
          <span className="text-red-300">"Lima."</span>)
        </span>
        <br />
        <span className="block">(</span>
        <span className="block ml-2">
          <span className="text-blue-300">cosine_similarity</span>(
          <span className="text-yellow-300">u</span>,{" "}
          <span className="text-yellow-300">v</span>),{" "}
          <span className="text-gray-300"># far apart</span>
        </span>
        <span className="block ml-2">
          <span className="text-blue-300">cosine_similarity</span>(
          <span className="text-yellow-300">M</span>{" "}
          <span className="text-purple-300">@</span>{" "}
          <span className="text-yellow-300">u</span>,{" "}
          <span className="text-yellow-300">M</span>{" "}
          <span className="text-purple-300">@</span>{" "}
          <span className="text-yellow-300">v</span>){" "}
          <span className="text-gray-300"># closer together!</span>
        </span>
        <span className="block">)</span>
      </div>
      <div>
        <p className="text-slate-400 text-sm mt-1">(illustration only)</p>
        <p className="text-xl text-slate-300 mt-2">
          Improve your RAG without leaving this page.
        </p>
      </div>
    </div>
  );
}
