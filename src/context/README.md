# Refatoração de Contexts - Separação de Responsabilidades

Este documento descreve a refatoração do estado global muito acoplado em múltiplos contexts especializados.

## Problema Resolvido

**Antes**: Context monolítico com muitas responsabilidades
```typescript
// ❌ PROBLEMA: Context com muitas responsabilidades
interface AppContextType {
  // 50+ propriedades e métodos
  user, hospitals, shifts, showEconomicValues, theme, currentView,
  overlapMessage, profileMessage, login, logout, updateUserProfile,
  addHospital, editHospital, deleteHospital, toggleHospitalStatus,
  addShift, bulkAddShifts, editShift, deleteShift, togglePaid,
  // ... mais 20+ métodos
}
```

**Depois**: Múltiplos contexts especializados
```typescript
// ✅ SOLUÇÃO: Contexts especializados
const { user, login, logout } = useAuth();           // Autenticação
const { hospitals, addHospital } = useHospitals();   // Hospitais
const { shifts, addShift } = useShifts();            // Plantões
const { currentView, setCurrentView } = useUI();     // Interface
```

## Estrutura dos Contexts

### 1. AuthContext (`src/context/AuthContext.tsx`)
**Responsabilidade**: Autenticação e gerenciamento de usuários

```typescript
interface AuthContextType {
  // State
  user: User | null;
  profileMessage: ProfileMessage | null;
  
  // Actions
  login: (email: string, password: string) => void;
  register: (userData: RegisterData) => void;
  logout: () => void;
  updateUserProfile: (updates: ProfileUpdates) => void;
  
  // Utilities
  clearProfileMessage: () => void;
}
```

### 2. HospitalContext (`src/context/HospitalContext.tsx`)
**Responsabilidade**: Gerenciamento de hospitais

```typescript
interface HospitalContextType {
  // State
  hospitals: Hospital[];
  
  // Actions
  addHospital: (hospital: Omit<Hospital, 'id'>) => void;
  editHospital: (id: string, hospital: Omit<Hospital, 'id'>) => void;
  deleteHospital: (id: string, shifts: Shift[]) => void;
  toggleHospitalStatus: (id: string) => void;
  
  // Computed values
  enabledHospitals: Hospital[];
}
```

### 3. ShiftContext (`src/context/ShiftContext.tsx`)
**Responsabilidade**: Gerenciamento de plantões

```typescript
interface ShiftContextType {
  // State
  shifts: Shift[];
  overlapMessage: string;
  
  // Actions
  addShift: (shift: Omit<Shift, 'id'>) => boolean;
  bulkAddShifts: (shifts: Omit<Shift, 'id'>[]) => OverlapResult;
  editShift: (id: string, shift: Omit<Shift, 'id'>) => boolean;
  deleteShift: (id: string) => void;
  togglePaid: (id: string) => void;
  
  // Computed values
  sortedShifts: Shift[];
  upcomingShifts: Shift[];
  
  // Utilities
  clearOverlapMessage: () => void;
}
```

### 4. UIContext (`src/context/UIContext.tsx`)
**Responsabilidade**: Estado da interface do usuário

```typescript
interface UIContextType {
  // State
  showEconomicValues: boolean;
  theme: 'light' | 'dark';
  currentView: string;
  
  // Actions
  setCurrentView: (view: string) => void;
  setShowEconomicValues: (show: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

## Como Usar

### Uso dos Contexts Especializados

```typescript
import { useAuth, useHospitals, useShifts, useUI } from '../context';

const MyComponent = () => {
  // Apenas o que você precisa
  const { user, login } = useAuth();
  const { hospitals, addHospital } = useHospitals();
  const { shifts, addShift } = useShifts();
  const { currentView, setCurrentView } = useUI();
  
  // Componente mais limpo e focado
};
```

### Compatibilidade com Código Existente

O `AppContext` mantém a interface original para compatibilidade:

```typescript
// Código existente continua funcionando
const { user, hospitals, shifts, addShift } = useAppContext();
```

## Estrutura de Providers

```typescript
export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  return (
    <UIProvider>
      <AuthProvider>
        <HospitalProvider>
          <ConnectedProviders>
            <AppContextCombiner>
              {children}
            </AppContextCombiner>
          </ConnectedProviders>
        </HospitalProvider>
      </AuthProvider>
    </UIProvider>
  );
};
```

## Benefícios da Refatoração

### 1. **Separação de Responsabilidades**
- Cada context tem uma responsabilidade específica
- Código mais organizado e fácil de entender

### 2. **Performance Melhorada**
- Componentes só re-renderizam quando o context relevante muda
- Redução de re-renders desnecessários

### 3. **Manutenibilidade**
- Mudanças em um domínio não afetam outros
- Testes mais focados e isolados

### 4. **Reutilização**
- Contexts podem ser usados independentemente
- Facilita a criação de novos componentes

### 5. **Type Safety**
- Interfaces mais específicas e claras
- Melhor IntelliSense e detecção de erros

### 6. **Escalabilidade**
- Fácil adicionar novos contexts
- Estrutura preparada para crescimento

## Migração Gradual

### Fase 1: ✅ Implementação dos Contexts Especializados
- Criados AuthContext, HospitalContext, ShiftContext, UIContext
- Mantida compatibilidade com AppContext

### Fase 2: Migração de Componentes (Opcional)
```typescript
// Antes
const { user, hospitals, shifts, addShift } = useAppContext();

// Depois
const { user } = useAuth();
const { hospitals } = useHospitals();
const { shifts, addShift } = useShifts();
```

### Fase 3: Remoção do AppContext (Futuro)
- Quando todos os componentes migrarem
- Simplificação da estrutura

## Exemplo de Uso Avançado

```typescript
// Componente que usa apenas autenticação
const LoginComponent = () => {
  const { login, user } = useAuth();
  // Não precisa de hospitals, shifts, etc.
};

// Componente que usa apenas hospitais
const HospitalList = () => {
  const { hospitals, addHospital } = useHospitals();
  // Não precisa de auth, shifts, etc.
};

// Componente que usa apenas plantões
const ShiftCalendar = () => {
  const { shifts, addShift, overlapMessage } = useShifts();
  // Não precisa de auth, hospitals, etc.
};
```

## Considerações de Performance

- **useMemo**: Usado em valores computados
- **useCallback**: Usado em funções passadas para componentes filhos
- **React.memo**: Pode ser usado em componentes que usam apenas um context

A refatoração está completa e oferece uma arquitetura muito mais limpa e escalável! 