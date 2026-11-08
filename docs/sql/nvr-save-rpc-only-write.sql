-- Applied to NovaRise Supabase on 2026-11-08.
-- Migration: nvr_save_rpc_only_write_access
-- Existing RPC is replaced with a narrowly scoped authenticated writer.
create or replace function public.nvr_save_campaign_if_revision(p_save_data jsonb,p_expected_revision bigint)
returns bigint language plpgsql security definer set search_path = ''
as $$
declare v_user uuid; v_revision bigint;
begin
 v_user := (select auth.uid());
 if v_user is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then
  raise exception 'Authenticated player required' using errcode='28000';
 end if;
 if p_save_data is null or pg_catalog.jsonb_typeof(p_save_data)<>'object' or pg_catalog.pg_column_size(p_save_data)>=65536 then
  raise exception 'Invalid campaign data' using errcode='22023';
 end if;
 if p_expected_revision is null then
  insert into public.nvr_game_saves(user_id,save_data,revision,updated_at)
  values(v_user,p_save_data,1,pg_catalog.now())
  on conflict(user_id) do nothing returning revision into v_revision;
 else
  update public.nvr_game_saves set save_data=p_save_data,revision=revision+1,updated_at=pg_catalog.now()
  where user_id=v_user and revision=p_expected_revision
  returning revision into v_revision;
 end if;
 return v_revision;
end;
$$;
revoke all on function public.nvr_save_campaign_if_revision(jsonb,bigint) from public,anon;
grant execute on function public.nvr_save_campaign_if_revision(jsonb,bigint) to authenticated;
revoke insert,update,delete on public.nvr_game_saves from authenticated,anon,public;
grant select on public.nvr_game_saves to authenticated;
