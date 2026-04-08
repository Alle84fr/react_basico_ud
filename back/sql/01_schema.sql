
IF OBJECT_ID('dbo.otps', 'U') IS NOT NULL
  DROP TABLE dbo.otps;
GO

IF OBJECT_ID('dbo.usuarios', 'U') IS NOT NULL
  DROP TABLE dbo.usuarios;
GO

CREATE TABLE dbo.usuarios (
  id UNIQUEIDENTIFIER NOT NULL
    CONSTRAINT PK_usuarios PRIMARY KEY
    CONSTRAINT DF_usuarios_id DEFAULT NEWID(),
  nome NVARCHAR(120) NOT NULL,
  email NVARCHAR(255) NOT NULL,
  senha_hash NVARCHAR(255) NOT NULL,
  cargo NVARCHAR(80) NOT NULL,
  fazenda NVARCHAR(120) NOT NULL,
  email_confirmado BIT NOT NULL
    CONSTRAINT DF_usuarios_email_confirmado DEFAULT 0,
  criado_em DATETIME2(0) NOT NULL
    CONSTRAINT DF_usuarios_criado_em DEFAULT SYSUTCDATETIME(),
  atualizado_em DATETIME2(0) NOT NULL
    CONSTRAINT DF_usuarios_atualizado_em DEFAULT SYSUTCDATETIME()
);
GO

CREATE UNIQUE INDEX UX_usuarios_email ON dbo.usuarios(email);
GO

CREATE TABLE dbo.otps (
  id UNIQUEIDENTIFIER NOT NULL
    CONSTRAINT PK_otps PRIMARY KEY
    CONSTRAINT DF_otps_id DEFAULT NEWID(),
  email NVARCHAR(255) NOT NULL,
  codigo_hash NVARCHAR(255) NOT NULL,
  expira_em DATETIME2(0) NOT NULL,
  usado BIT NOT NULL
    CONSTRAINT DF_otps_usado DEFAULT 0,
  tentativas INT NOT NULL
    CONSTRAINT DF_otps_tentativas DEFAULT 0,
  criado_em DATETIME2(0) NOT NULL
    CONSTRAINT DF_otps_criado_em DEFAULT SYSUTCDATETIME(),
  usado_em DATETIME2(0) NULL
);
GO

CREATE INDEX IX_otps_email ON dbo.otps(email);
GO

CREATE INDEX IX_otps_expira_em ON dbo.otps(expira_em);
GO

IF OBJECT_ID('dbo.funcionarios', 'U') IS NOT NULL
  DROP TABLE dbo.funcionarios;
GO

CREATE TABLE dbo.funcionarios (
  id_func NVARCHAR(4) NOT NULL
    CONSTRAINT PK_funcionarios PRIMARY KEY,
  nome_func NVARCHAR(120) NOT NULL,
  funcao NVARCHAR(80) NOT NULL,
  data_admi DATE NOT NULL,
  setor NVARCHAR(120) NULL,
  data_aniversario DATE NULL,
  observacao NVARCHAR(500) NULL,
  senha_hash NVARCHAR(255) NOT NULL,
  foto_base64 NVARCHAR(MAX) NULL,
  criado_em DATETIME2(0) NOT NULL
    CONSTRAINT DF_funcionarios_criado_em DEFAULT SYSUTCDATETIME(),
  atualizado_em DATETIME2(0) NOT NULL
    CONSTRAINT DF_funcionarios_atualizado_em DEFAULT SYSUTCDATETIME()
);
GO
