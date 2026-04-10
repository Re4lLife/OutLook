"use client";

import { useActionState, useEffect, useState, useTransition } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { signIn } from '../_lib/actions/signIn';
import { resendVerification } from '../_lib/actions/resendEmail';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function SignInContent() {
    const searchParams = useSearchParams();
    const urlSuccess = searchParams.get('success');
    const urlError = searchParams.get('error');
    const [showPassword, setShowPassword] = useState(false);
    const [state, formAction, pending] = useActionState(signIn, null);
    const [isPending, startTransition] = useTransition();
    const [resendMessage, setResendMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (state?.token) {
            localStorage.setItem("outlook_token", state.token);
            
            setTimeout(() => {
                router.push("/chat");
            }, 1500); 
        }
    }, [state?.token, router]);


    const handleResend = (email) => {
        startTransition(async () => {
            const result = await resendVerification(email);
            if (result?.success) {
                setResendMessage(result.success);
                setIsSuccess(true);
            } else {
                setResendMessage(result?.error || "Error resending email❗");
                setIsSuccess(false);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <form
                action={formAction}
                className="w-full max-w-112.5 bg-[#1a0b3d]/50 backdrop-blur-md border border-white/10 p-10 rounded-2xl shadow-2xl">
                <h2 className="text-white text-3xl font-bold mb-2 text-center">Welcome Back</h2>
                <p className="text-gray-400 text-center mb-8 text-sm">Sign in to your outlook account</p>

                {urlSuccess && !state && (
                    <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/50 font-bold text-green-500 text-xs text-center">
                        {urlSuccess}
                    </div>
                )}

                {urlError && !state && (
                    <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 font-bold text-red-500 text-xs text-center">
                        {urlError}
                    </div>
                )}

                {state?.error && (
                    <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 font-bold text-red-500 text-xs text-center">
                        {state.error}
                        {state.needsVerification && (
                            <div className="mt-2">
                                {!isSuccess && (
                                    <button
                                        type="button"
                                        disabled={isPending}
                                        onClick={() => handleResend(state.email)}
                                        className="underline hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {isPending ? "Sending..." : "Resend verification link?"}
                                    </button>
                                )}

                                {resendMessage && (
                                    <p className={`mt-1 text-[10px] ${isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                                        {resendMessage}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {state?.success && (
                    <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/50 font-bold text-green-500 text-xs text-center">
                        {state.success}
                    </div>
                )}

                <div className="space-y-6">
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
                        <div className="flex justify-between mb-2 ml-1">
                            <label className="block text-gray-300 text-xs uppercase tracking-widest">Password</label>
                        </div>
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

                    <button
                        disabled={pending}
                        className="w-full bg-linear-to-r from-purple-500 to-blue-900 hover:from-purple-900 text-white font-semibold py-3 rounded-lg shadow-lg transform transition active:scale-[0.98] mt-4">
                        {pending ? "SUBMITTING..." : "SIGN IN"}
                    </button>

                    <p className="text-center text-gray-400 text-sm mt-6">
                        New here?{" "}
                        <Link href="/get-started/sign-up" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                            Create an account
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
}