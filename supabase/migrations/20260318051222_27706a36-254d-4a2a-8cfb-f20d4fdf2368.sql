
-- Seed: 5 proprietários
INSERT INTO public.clients (name, company, document, phone, email, type, address, notes) VALUES
('Carlos Mendes', '', '123.456.789-00', '(41) 99901-1001', 'carlos.mendes@email.com', 'landowner', 'PR-412, Km 12 - Garuva/SC', 'Proprietário de terreno na PR-412, trecho Garuva'),
('Maria Silva', '', '234.567.890-11', '(41) 99902-2002', 'maria.silva@email.com', 'landowner', 'PR-412, Km 25 - Guaratuba/PR', 'Terreno próximo ao trevo de Guaratuba'),
('João Oliveira', '', '345.678.901-22', '(41) 99903-3003', 'joao.oliveira@email.com', 'landowner', 'PR-508, Km 8 - Alexandra/PR', 'Terreno margem da PR-508'),
('Ana Costa', '', '456.789.012-33', '(41) 99904-4004', 'ana.costa@email.com', 'landowner', 'BR-277, Km 45 - Morretes/PR', 'Terreno na BR-277 sentido litoral'),
('Pedro Santos', '', '567.890.123-44', '(41) 99905-5005', 'pedro.santos@email.com', 'landowner', 'PR-412, Km 38 - Matinhos/PR', 'Propriedade rural com frente para rodovia');

-- Seed: 5 anunciantes
INSERT INTO public.clients (name, company, document, phone, email, type, address, segment, notes) VALUES
('Roberto Almeida', 'Construtora Litoral', '12.345.678/0001-01', '(41) 99911-1111', 'roberto@construtoralitoral.com.br', 'advertiser', 'Curitiba/PR', 'Construção Civil', 'Anunciante de empreendimentos imobiliários no litoral'),
('Fernanda Lima', 'Supermercados Oceano', '23.456.789/0001-02', '(41) 99922-2222', 'fernanda@superoceano.com.br', 'advertiser', 'Guaratuba/PR', 'Varejo', 'Rede de supermercados com 3 lojas no litoral'),
('Lucas Martins', 'Hotel Marina Bay', '34.567.890/0001-03', '(41) 99933-3333', 'lucas@marinabay.com.br', 'advertiser', 'Matinhos/PR', 'Hotelaria', 'Hotel de alto padrão em Matinhos'),
('Camila Rocha', 'Auto Center PR', '45.678.901/0001-04', '(41) 99944-4444', 'camila@autocentrepr.com.br', 'advertiser', 'Paranaguá/PR', 'Automotivo', 'Rede de oficinas e autopeças'),
('Bruno Ferreira', 'Imobiliária Praia Grande', '56.789.012/0001-05', '(41) 99955-5555', 'bruno@praiagrande.com.br', 'advertiser', 'Pontal do Paraná/PR', 'Imobiliário', 'Venda e locação de imóveis no litoral');
