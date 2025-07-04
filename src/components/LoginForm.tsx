import React, { useState } from 'react';
import { Eye, EyeOff, Heart, Activity, Clock, Calendar, Stethoscope, BarChart3, Building2, ActivitySquare } from 'lucide-react';
import { useLoginForm } from '../hooks/useLoginForm';
import { useRegisterForm } from '../hooks/useRegisterForm';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister?: (userData: { name: string; email: string; password: string; specialty?: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const loginForm = useLoginForm({ onLogin });
  const registerForm = useRegisterForm({ onRegister: onRegister || (() => {}) });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      const success = await registerForm.handleSubmit(e);
      if (!success) {
        // Show first error message
        const firstError = Object.values(registerForm.errors)[0];
        if (firstError) {
          alert(firstError);
        }
      }
    } else {
      const success = await loginForm.handleSubmit(e);
      if (!success) {
        // Show first error message
        const firstError = Object.values(loginForm.errors)[0];
        if (firstError) {
          alert(firstError);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-10 left-10 opacity-10">
          <Heart className="w-32 h-32 text-blue-600 animate-pulse" />
        </div>
        <div className="absolute top-32 right-20 opacity-10">
          <Activity className="w-24 h-24 text-teal-600 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute bottom-32 left-32 opacity-10">
          <Clock className="w-28 h-28 text-blue-500 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        <div className="absolute bottom-20 right-40 opacity-10">
          <Calendar className="w-20 h-20 text-teal-500 animate-bounce" style={{ animationDelay: '3s' }} />
        </div>
        <div className="absolute top-1/2 left-1/4 opacity-10">
          <Stethoscope className="w-36 h-36 text-blue-400 animate-pulse" style={{ animationDelay: '4s' }} />
        </div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gray-800 rounded-xl shadow-2xl px-6 py-7 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-cyan-500 rounded-lg p-3 mb-3">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">MedShift</h1>
            <p className="text-gray-200 text-sm">Gerencie seus plantões médicos</p>
          </div>
          {!forgotPassword ? (
            <>
              <form onSubmit={handleSubmit} className="w-full space-y-3">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">Nome</label>
                    <input
                      type="text"
                      value={registerForm.formData.name}
                      onChange={(e) => registerForm.updateField('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-200 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={isRegister ? registerForm.formData.email : loginForm.formData.email}
                    onChange={(e) => isRegister 
                      ? registerForm.updateField('email', e.target.value)
                      : loginForm.updateField('email', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    placeholder="Email"
                    required
                  />
                </div>
                {isRegister && (
                  <div>
                    <label className="block text-xs font-medium text-gray-200 mb-1">Especialidade (opcional)</label>
                    <input
                      type="text"
                      value={registerForm.formData.specialty || ''}
                      onChange={(e) => registerForm.updateField('specialty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      placeholder="Ex: Cardiologia, Pediatria, etc."
                    />
                  </div>
                )}
                <div className="relative">
                  <label className="block text-xs font-medium text-gray-200 mb-1">Senha</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={isRegister ? registerForm.formData.password : loginForm.formData.password}
                    onChange={(e) => isRegister 
                      ? registerForm.updateField('password', e.target.value)
                      : loginForm.updateField('password', e.target.value)
                    }
                    className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                    placeholder="Senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-7 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {isRegister && (
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-200 mb-1">Confirmar Senha</label>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerForm.formData.confirmPassword}
                      onChange={(e) => registerForm.updateField('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                      placeholder="Confirme a senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 top-7 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isRegister ? registerForm.isSubmitting : loginForm.isSubmitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-lg mt-1 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {(isRegister ? registerForm.isSubmitting : loginForm.isSubmitting) ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {isRegister ? 'Cadastrando...' : 'Entrando...'}
                    </div>
                  ) : (
                    isRegister ? 'Cadastrar' : 'Entrar'
                  )}
                </button>
              </form>
              <div className="mt-4 w-full text-center text-gray-300 text-xs">
                <p className="mb-1">Versão de demonstração<br /><span className="text-[10px] text-gray-400">
                  {isRegister ? 'Cadastre-se ou use admin@medshift.com / admin123' : 'Cadastre-se ou use qualquer email / 123456'}
                </span></p>
                {!isRegister && (
                  <button className="font-semibold text-cyan-400 hover:underline text-xs" type="button" onClick={() => setForgotPassword(true)}>Esqueceu a senha?</button>
                )}
                <div className="mt-2">
                  {isRegister ? (
                    <span>
                      Já tem conta?{' '}
                      <button className="text-cyan-400 hover:underline font-semibold text-xs" type="button" onClick={() => setIsRegister(false)}>
                        Entrar
                      </button>
                    </span>
                  ) : (
                    <span>
                      Não tem conta?{' '}
                      <button className="text-cyan-400 hover:underline font-semibold text-xs" type="button" onClick={() => setIsRegister(true)}>
                        Cadastre-se
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col items-center">
              {!resetSent ? (
                <>
                  <h2 className="text-lg font-bold text-white mb-2">Recuperar Senha</h2>
                  <p className="text-gray-300 text-xs mb-4 text-center">Informe seu e-mail cadastrado para receber instruções de redefinição de senha.</p>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm mb-3"
                    placeholder="Seu e-mail"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                  />
                  <button
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-3 rounded-lg font-semibold transition-all duration-200 shadow-lg text-base mb-2"
                    onClick={() => { setResetSent(true); }}
                  >
                    Enviar
                  </button>
                  <button
                    className="text-cyan-400 hover:underline font-semibold text-xs"
                    type="button"
                    onClick={() => { setForgotPassword(false); setResetSent(false); setResetEmail(''); }}
                  >
                    Voltar para o login
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-white mb-2">Verifique seu e-mail</h2>
                  <p className="text-gray-300 text-xs mb-4 text-center">Se o e-mail informado estiver cadastrado, você receberá as instruções para redefinir sua senha.</p>
                  <button
                    className="text-cyan-400 hover:underline font-semibold text-xs"
                    type="button"
                    onClick={() => { setForgotPassword(false); setResetSent(false); setResetEmail(''); }}
                  >
                    Voltar para o login
                  </button>
                </>
              )}
            </div>
          )}
          <div className="mt-5 flex justify-center gap-6 w-full">
            <div className="flex flex-col items-center">
              <ActivitySquare className="w-7 h-7 text-blue-500 mb-1" />
              <span className="text-[11px] text-gray-300">Plantões</span>
            </div>
            <div className="flex flex-col items-center">
              <Building2 className="w-7 h-7 text-green-500 mb-1" />
              <span className="text-[11px] text-gray-300">Hospitais</span>
            </div>
            <div className="flex flex-col items-center">
              <BarChart3 className="w-7 h-7 text-purple-500 mb-1" />
              <span className="text-[11px] text-gray-300">Relatórios</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;