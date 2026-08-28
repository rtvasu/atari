'use client';

import { useRouter } from 'next/navigation';

type FieldProps = {
  label: string;
  autoFocus?: boolean;
  type: string;
  name: string;
};

function Field({ label, autoFocus, type, name }: FieldProps) {
  return (
    <label className="max-w-xs flex justify-between">
      {label}:
      <input required autoFocus={autoFocus} type={type} name={name} className="border border-foreground px-2 rounded-sm" />
    </label>
  );
}

export default function Login() {
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('email'),
        password: formData.get('password'),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    router.push('/home');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <Field label="Email" name="email" type="email" autoFocus />
      <Field label="Password" name="password" type="password" />
      <button className="
        border border-foreground
        rounded-sm max-w-xs cursor-pointer
        bg-fuchsia-400 hover:bg-fuchsia-500">
          Login
      </button>
    </form>
  );
}
