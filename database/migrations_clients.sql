-- Migration to add clients (les clients li 3ndhom ma3rifa)

CREATE TABLE IF NOT EXISTS public.clients (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    phone text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT clients_pkey PRIMARY KEY (id)
);

-- Turn on RLS for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to clients
CREATE POLICY "Enable all access for authenticated users to clients" ON public.clients
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create table for tracking what the clients took (purchases) and their payments (versements)
CREATE TABLE IF NOT EXISTS public.client_transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL,
    type text NOT NULL CHECK (type IN ('purchase', 'payment')),
    amount numeric NOT NULL,
    description text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT client_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT client_transactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE
);

-- Turn on RLS for client_transactions
ALTER TABLE public.client_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to client_transactions
CREATE POLICY "Enable all access for authenticated users to client_transactions" ON public.client_transactions
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
