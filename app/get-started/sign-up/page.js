"use client";
import { useActionState, useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { signUp } from '../../_lib/actions/signUp';



export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction, pending] = useActionState(signUp, null);

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <form
                action={formAction}
                className="w-full max-w-112.5 bg-[#1a0b3d]/50 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl">
                <h2 className="text-white text-3xl font-bold mb-2 text-center">Create Account</h2>
                <p className="text-gray-400 text-center mb-8 text-sm">Join outlook today!</p>

                {state?.error && (
                    <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 font-bold text-red-500 text-xs text-center">
                        {state.error}
                    </div>
                )}
                {state?.success && (
                    <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/50 font-bold text-green-500 text-xs text-center">
                        {state.success}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-xs uppercase tracking-widest mb-2 ml-1">Username</label>
                        <input
                            name='username'
                            disabled={pending}
                            type="text"
                            placeholder="e.g. janesmith200"
                            className="w-full bg-[#0d012e]/80 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-xs uppercase tracking-widest mb-2 ml-1">Email Address</label>
                        <input
                            name='email'
                            disabled={pending}
                            type="email"
                            placeholder="name@hotmail.com"
                            className="w-full bg-[#0d012e]/80 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all" />
                    </div>

                    <div>
                        <label className="block text-gray-300 text-xs uppercase tracking-widest mb-2 ml-1">Password</label>
                        <div className="relative">
                            <input
                                name='password'
                                disabled={pending}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-[#0d012e]/80 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                            />
                            <button
                                type="button"
                                disabled={pending}
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <button disabled={pending} className="w-full bg-linear-to-r from-purple-500 to-blue-900 hover:from-purple-900  text-white font-semibold py-3 rounded-lg shadow-lg transform transition active:scale-[0.98] mt-4">
                        {pending ? "SUBMITTING..." : "SIGN UP"}
                    </button>
                </div>
            </form>
        </div>
    );
} 