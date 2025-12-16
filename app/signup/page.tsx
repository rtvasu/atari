'use client';

export default function SignUp() {
  type FieldProps = {
    label: string;
    autoFocus?: boolean;
    type: string;
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('email'),
        password: formData.get('password'),
        phone: Number(formData.get('phone')),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }
  }

  function Field({ label, autoFocus, type }: FieldProps) {
    return (
      <label className="max-w-xs flex justify-between">
        {label}:
        <input required autoFocus={autoFocus} type={type} className="border border-foreground px-2 rounded-sm" />
      </label>
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <Field label="Email" type="email" autoFocus />
      <Field label="Password" type="password" />
      <Field label="Phone" type="tel" />
      <button onClick={() => {}} className="
        border border-foreground
        rounded-sm max-w-xs cursor-pointer
        bg-fuchsia-400 hover:bg-fuchsia-500">
          Sign Up
      </button>
    </form>
  );
}
