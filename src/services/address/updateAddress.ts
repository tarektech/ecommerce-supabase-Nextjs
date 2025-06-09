import { supabase } from '@/lib/supabase/client';
import { AddressType } from '@/types';
import { toast } from 'sonner';

export async function updateAddress(
  addressId: string,
  address: Partial<AddressType>
) {
  const { data, error } = await supabase
    .from('addresses')
    .update({
      street: address.street,
      city: address.city,
      state: address.state || '',
      zip_code: address.zip_code,
      country: address.country,
      is_default: address.is_default || false,
    })
    .eq('id', addressId)
    .select()
    .single();

  if (error) {
    toast.error('Failed to update address');
    throw error;
  }
  return data;
}
