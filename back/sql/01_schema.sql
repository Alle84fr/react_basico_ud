
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
