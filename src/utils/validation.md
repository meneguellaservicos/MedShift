# Sistema de Validação Centralizado

Este documento descreve o sistema de validação centralizado implementado para resolver o problema de lógica de validação nos componentes.

## Problema Resolvido

**Antes**: Lógica de validação espalhada pelos componentes
```typescript
// ❌ PROBLEMA: Lógica de validação no componente
const validateForm = (): boolean => {
  const errors = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  // Validação complexa no componente
};
```

**Depois**: Sistema centralizado com hooks customizados
```typescript
// ✅ SOLUÇÃO: Hook customizado com validação centralizada
const profileForm = useProfileForm({ 
  user, 
  onUpdateProfile: handleUpdateProfile 
});
```

## Estrutura do Sistema

### 1. Validações Centralizadas (`src/utils/validation.ts`)

- **Funções de validação específicas**: `validateLoginForm`, `validateRegisterForm`, `validateProfileForm`, etc.
- **Tipos TypeScript**: `ValidationErrors`, `ValidationResult`, interfaces para cada formulário
- **Funções utilitárias**: `clearValidationError`, `getPasswordStrength`

### 2. Hook Genérico (`src/hooks/useFormValidation.ts`)

Hook reutilizável que gerencia:
- Estado do formulário
- Validação em tempo real
- Submissão com tratamento de erros
- Limpeza automática de erros

### 3. Hooks Específicos

- `useLoginForm`: Para formulários de login
- `useRegisterForm`: Para formulários de registro
- `useProfileForm`: Para formulários de perfil
- `useHospitalForm`: Para formulários de hospital

## Como Usar

### Exemplo: Formulário de Login

```typescript
import { useLoginForm } from '../hooks/useLoginForm';

const LoginComponent = () => {
  const loginForm = useLoginForm({ 
    onLogin: handleLogin 
  });

  return (
    <form onSubmit={loginForm.handleSubmit}>
      <input
        value={loginForm.formData.email}
        onChange={(e) => loginForm.updateField('email', e.target.value)}
        className={loginForm.errors.email ? 'error' : ''}
      />
      {loginForm.errors.email && (
        <span>{loginForm.errors.email}</span>
      )}
      
      <button disabled={loginForm.isSubmitting}>
        {loginForm.isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};
```

### Exemplo: Formulário de Perfil

```typescript
import { useProfileForm } from '../hooks/useProfileForm';

const ProfileComponent = () => {
  const profileForm = useProfileForm({ 
    user, 
    onUpdateProfile: handleUpdateProfile 
  });

  const handleSubmit = async (e: React.FormEvent) => {
    const success = await profileForm.handleSubmit(e);
    if (success) {
      // Reset password fields
      profileForm.setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
    </form>
  );
};
```

## Benefícios

1. **Separação de Responsabilidades**: Lógica de validação separada dos componentes
2. **Reutilização**: Hooks podem ser usados em múltiplos componentes
3. **Consistência**: Validações padronizadas em toda a aplicação
4. **Manutenibilidade**: Mudanças na validação em um só lugar
5. **Type Safety**: TypeScript garante tipos corretos
6. **Testabilidade**: Funções de validação podem ser testadas isoladamente

## Adicionando Novas Validações

1. **Criar função de validação** em `src/utils/validation.ts`:
```typescript
export function validateNewForm(data: NewFormData): ValidationResult {
  const errors: ValidationErrors = {};
  // Lógica de validação
  return { isValid: Object.keys(errors).length === 0, errors };
}
```

2. **Criar hook específico** em `src/hooks/useNewForm.ts`:
```typescript
export function useNewForm({ onSubmit }: UseNewFormOptions) {
  const formValidation = useFormValidation({
    initialData: { /* dados iniciais */ },
    validateFunction: validateNewForm,
    onSubmit
  });
  return formValidation;
}
```

3. **Usar no componente**:
```typescript
const newForm = useNewForm({ onSubmit: handleSubmit });
```

## Validações Disponíveis

- **Email**: Formato válido de email
- **Senha**: Mínimo 8 caracteres, maiúscula, minúscula, número, caractere especial
- **Nome**: Mínimo 2 caracteres
- **Taxa horária**: Valor numérico válido
- **Cor**: Código hexadecimal válido
- **Horários**: Lógica de início/fim de plantão 