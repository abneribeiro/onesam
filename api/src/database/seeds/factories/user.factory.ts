export interface BaseUserData {
  nome: string;
  email: string;
  genero: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
  dataNascimento: Date;
  telefone?: string;
  localizacao?: string;
}

export interface FormandoData extends BaseUserData {
  empresa?: string;
  cargo?: string;
  areasInteresse: string[];
  objetivosProfissionais?: string;
}

export interface AdminData extends BaseUserData {
  departamento: string;
}

// Demo user data generators
export function generateFormandosData(): FormandoData[] {
  return [
    {
      nome: 'Pedro Costa',
      email: 'pedro.costa@example.com',
      genero: 'masculino',
      dataNascimento: new Date('1990-05-15'),
      telefone: '+351 912 345 678',
      localizacao: 'Lisboa, Portugal',
      empresa: 'TechLab Solutions',
      cargo: 'Desenvolvedor Frontend',
      areasInteresse: ['Desenvolvimento Web', 'Data Science', 'DevOps'],
      objetivosProfissionais: 'Tornar-me um arquiteto de software sênior nos próximos 3 anos'
    },
    {
      nome: 'Ana Silva',
      email: 'ana.silva@example.com',
      genero: 'feminino',
      dataNascimento: new Date('1988-09-22'),
      telefone: '+351 923 456 789',
      localizacao: 'Porto, Portugal',
      empresa: 'Design Studio',
      cargo: 'UX Designer',
      areasInteresse: ['Design e Criatividade', 'Marketing Digital'],
      objetivosProfissionais: 'Liderar equipas de design em empresas de tecnologia'
    }
    // Add more demo users as needed...
  ];
}

export function generateAdminsData(): AdminData[] {
  return [
    {
      nome: 'João Ferreira',
      email: 'joao.ferreira@onesam.pt',
      genero: 'masculino',
      dataNascimento: new Date('1985-03-10'),
      telefone: '+351 934 567 890',
      localizacao: 'Lisboa, Portugal',
      departamento: 'Tecnologia'
    },
    {
      nome: 'Maria Santos',
      email: 'maria.santos@onesam.pt',
      genero: 'feminino',
      dataNascimento: new Date('1982-07-18'),
      telefone: '+351 945 678 901',
      localizacao: 'Porto, Portugal',
      departamento: 'Educação'
    }
  ];
}