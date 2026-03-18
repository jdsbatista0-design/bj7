
-- Link billboards to landowners
UPDATE public.billboards SET land_owner = 'Carlos Mendes', land_owner_id = 'fe24aa7d-e4d1-414b-a33a-0535ede37ed2' WHERE code IN ('1001', '1002');
UPDATE public.billboards SET land_owner = 'Maria Silva', land_owner_id = '44b4be70-7265-4bf3-b389-6423f32fc31b' WHERE code IN ('1003', '1004');
UPDATE public.billboards SET land_owner = 'João Oliveira', land_owner_id = '596f307e-d747-41ca-9082-ac1d49facefd' WHERE code IN ('1005', '1006');
UPDATE public.billboards SET land_owner = 'Ana Costa', land_owner_id = 'c8b0190c-5e9e-4d69-8673-3de94077514b' WHERE code IN ('2001', '2002');
UPDATE public.billboards SET land_owner = 'Pedro Santos', land_owner_id = '5cb27fef-f5f2-4acc-b11c-7bf70ea834d7' WHERE code IN ('2003', '2004');

-- Contracts: 3 veiculação (anunciantes) + 2 locação (proprietários)
INSERT INTO public.contracts (type, client_id, client_name, billboard_ids, start_date, end_date, monthly_value, total_value, status, payment_method, notes) VALUES
('veiculacao', 'ee56eabe-ada3-4ee3-8c97-d1c8c72fb8fb', 'Construtora Litoral', ARRAY['6bd7ddaf-45c8-4c95-9b35-32100bcdeb19','e2168efb-1b72-4166-9965-fc5d41da63e3'], '2026-01-01', '2026-12-31', 4500, 54000, 'active', 'Boleto bancário', 'Contrato anual - 2 painéis PR-412'),
('veiculacao', '6bff5976-faff-4227-887d-5baad502d3ef', 'Supermercados Oceano', ARRAY['1dd676be-9732-4ba6-bbf7-80f005a963c9'], '2026-03-01', '2026-08-31', 2800, 16800, 'active', 'Transferência', 'Contrato temporada - 1 painel'),
('veiculacao', '01df4a16-0feb-43c3-ac31-f5aab9648463', 'Hotel Marina Bay', ARRAY['ae0177b3-0b5c-46e6-8e00-106efbc046e5','e2d889b7-c7d2-4581-9270-80ac4150fba4'], '2026-06-01', '2026-12-31', 5200, 36400, 'pending', 'Boleto bancário', 'Aguardando assinatura'),
('locacao_terreno', 'fe24aa7d-e4d1-414b-a33a-0535ede37ed2', 'Carlos Mendes', ARRAY['6bd7ddaf-45c8-4c95-9b35-32100bcdeb19','e2168efb-1b72-4166-9965-fc5d41da63e3'], '2025-01-01', '2027-12-31', 800, 28800, 'active', 'PIX', 'Locação de terreno para 2 painéis na PR-412'),
('locacao_terreno', '44b4be70-7265-4bf3-b389-6423f32fc31b', 'Maria Silva', ARRAY['1dd676be-9732-4ba6-bbf7-80f005a963c9','90b47b5b-bf83-44e2-a6f2-4a3cb223fc8c'], '2025-06-01', '2028-05-31', 600, 21600, 'active', 'PIX', 'Locação de terreno para 2 painéis');

-- Mark occupied billboards (those with active veiculação contracts)
UPDATE public.billboards SET status = 'occupied', commercial_status = 'occupied' WHERE id IN ('6bd7ddaf-45c8-4c95-9b35-32100bcdeb19','e2168efb-1b72-4166-9965-fc5d41da63e3','1dd676be-9732-4ba6-bbf7-80f005a963c9');

-- Work Orders
INSERT INTO public.work_orders (type, billboard_id, billboard_code, client_name, client_id, assignee, status, due_date, sla_hours, checklist) VALUES
('installation', '6bd7ddaf-45c8-4c95-9b35-32100bcdeb19', '1001', 'Construtora Litoral', 'ee56eabe-ada3-4ee3-8c97-d1c8c72fb8fb', 'Equipe Campo', 'completed', '2026-01-10', 48, '[{"item":"Verificar estrutura","done":true},{"item":"Instalar lona","done":true},{"item":"Fotos de evidência","done":true}]'::jsonb),
('installation', 'e2168efb-1b72-4166-9965-fc5d41da63e3', '1002', 'Construtora Litoral', 'ee56eabe-ada3-4ee3-8c97-d1c8c72fb8fb', 'Equipe Campo', 'completed', '2026-01-12', 48, '[{"item":"Verificar estrutura","done":true},{"item":"Instalar lona","done":true},{"item":"Limpar área","done":true}]'::jsonb),
('installation', '1dd676be-9732-4ba6-bbf7-80f005a963c9', '1003', 'Supermercados Oceano', '6bff5976-faff-4227-887d-5baad502d3ef', 'Equipe Campo', 'in_progress', '2026-03-20', 48, '[{"item":"Verificar estrutura","done":true},{"item":"Instalar lona","done":false},{"item":"Fotos finais","done":false}]'::jsonb),
('maintenance', 'ae0177b3-0b5c-46e6-8e00-106efbc046e5', '1005', '', NULL, 'Equipe Manutenção', 'pending', '2026-03-25', 24, '[{"item":"Trocar iluminação","done":false},{"item":"Pintura da estrutura","done":false}]'::jsonb),
('inspection', '16037de4-8a6e-4a9b-b7f8-fe383fa112e9', '2001', '', NULL, 'Equipe Vistoria', 'pending', '2026-03-28', 12, '[{"item":"Verificar estado da lona","done":false},{"item":"Foto atualizada","done":false},{"item":"Reportar condição","done":false}]'::jsonb);

-- Financial entries
INSERT INTO public.financial_entries (category, description, amount, type, entry_date, client_id, contract_id, billboard_id, status, notes) VALUES
('operacional', 'Instalação painéis 1001 e 1002 - Construtora Litoral', 2500, 'expense', '2026-01-10', 'ee56eabe-ada3-4ee3-8c97-d1c8c72fb8fb', NULL, '6bd7ddaf-45c8-4c95-9b35-32100bcdeb19', 'paid', 'Mão de obra + material'),
('operacional', 'Manutenção estrutura painel 1005', 800, 'expense', '2026-03-15', NULL, NULL, 'ae0177b3-0b5c-46e6-8e00-106efbc046e5', 'pending', 'Orçamento aprovado'),
('administrativo', 'Seguro anual dos painéis', 3600, 'expense', '2026-01-15', NULL, NULL, NULL, 'paid', 'Seguro cobertura completa'),
('imposto', 'ISS trimestral', 1200, 'expense', '2026-03-10', NULL, NULL, NULL, 'paid', 'Referente 1º trimestre 2026');

-- Seed leads for pipeline testing
INSERT INTO public.leads (company, contact, phone, email, stage, value, origin, notes) VALUES
('Posto Litoral Sul', 'Marcos Vieira', '(41) 99966-6666', 'marcos@postolitoralsul.com.br', 'qualified', 3500, 'site', 'Interessado em 1 painel na PR-412'),
('Farmácia Popular', 'Diana Souza', '(41) 99977-7777', 'diana@farmaciapopular.com.br', 'proposal', 2200, 'indicacao', 'Proposta enviada para painel na PR-508'),
('Restaurante Mar Azul', 'Paulo Henrique', '(41) 99988-8888', 'paulo@marazul.com.br', 'negotiation', 4800, 'prospecção', 'Negociando 2 painéis, temporada verão')
