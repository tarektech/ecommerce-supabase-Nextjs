import { supabase } from '@/lib/supabase/client';
import { AddressType } from '@/types';
import { toast } from 'sonner';

interface SaveAddressParams {
  address: AddressType;
  userId: string;
}

export async function saveAddress({ address, userId }: SaveAddressParams) {
  const { data, error } = await supabase
    .from('addresses')
    .insert([
      {
        user_id: userId,
        street: address.street,
        city: address.city,
        state: address.state || '',
        zip_code: address.zip_code,
        country: address.country,
        is_default: address.is_default || false,
      },
    ])
    .select()
    .single();

  if (error) {
    toast.error('Failed to save address');
    throw error;
  }
  return data;
}
