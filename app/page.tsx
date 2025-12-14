export default function Home() {
  return (
    <div className="flex flex-col">
      <label>
        Username: 
        <input autoFocus className="border border-foreground px-2" />
      </label>
      <label>
        Password: 
        <input className="border border-foreground px-2" />
      </label>
      <label>
        Phone: 
        <input className="border border-foreground px-2" />
      </label>
      <button className="border border-foreground max-w-xs cursor-pointer bg-fuchsia-400 hover:bg-fuchsia-500">Sign Up</button>
    </div>
  );
}
