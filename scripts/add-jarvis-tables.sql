-- Create conversations table for chat history
create table if not exists conversations (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

-- Create google_tokens table for OAuth tokens
create table if not exists google_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  service text not null check (service in ('calendar', 'gmail')),
  tokens jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, service)
);

-- Enable RLS (Row Level Security)
alter table conversations enable row level security;
alter table google_tokens enable row level security;

-- Create policies for conversations
create policy "Users can view their own conversations" on conversations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own conversations" on conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own conversations" on conversations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own conversations" on conversations
  for delete using (auth.uid() = user_id);

-- Create policies for google_tokens
create policy "Users can view their own tokens" on google_tokens
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tokens" on google_tokens
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tokens" on google_tokens
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tokens" on google_tokens
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists conversations_created_at_idx on conversations(created_at);
create index if not exists google_tokens_user_id_idx on google_tokens(user_id);
create index if not exists google_tokens_service_idx on google_tokens(service); 