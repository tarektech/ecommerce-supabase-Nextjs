import { supabase } from '@/lib/supabase/client';
import { AddressType } from '@/types';
import { toast } from 'sonner';

interface SaveAddressParams {
  address: AddressType;
  userId: string;
}

export const addressService = {
  async saveAddress({ address, userId }: SaveAddressParams) {
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
  },

  async getAddresses(userId: string) {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch addresses');
      throw error;
    }
    return data;
  },

  async updateAddress(addressId: string, address: Partial<AddressType>) {
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
  },

  async deleteAddress(addressId: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId);

    if (error) {
      toast.error('Failed to delete address');
      throw error;
    }
    return true;
  },
};
