export default function Home() {
  type FieldProps = {
    label: string;
    autoFocus?: boolean;
  };

  function Field({ label, autoFocus }: FieldProps) {
    return (
      <label className="max-w-xs flex justify-between">
        {label}:
        <input autoFocus={autoFocus} className="border border-foreground px-2" />
      </label>
    );
  };
  
  return (
    <div className="flex flex-col gap-3 p-4">
      <Field label="Email" autoFocus />
      <Field label="Password" />
      <Field label="Phone" />
      <button className="border border-foreground max-w-xs cursor-pointer bg-fuchsia-300 hover:bg-fuchsia-400">Sign Up</button>
    </div>
  );
}
