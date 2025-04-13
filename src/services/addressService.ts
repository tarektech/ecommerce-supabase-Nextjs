import { supabase } from '../utils/supabase';
import { AddressType } from '@/types';

export const addressService = {
  async getUserAddresses(userId: string): Promise<AddressType[]> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error(`Error fetching addresses for user ${userId}:`, error);
      return [];
    }
  },

  async getAddressById(id: number): Promise<AddressType | null> {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching address with id ${id}:`, error);
      return null;
    }
  },

  async createAddress(address: Omit<AddressType, 'id'>): Promise<AddressType | null> {
    try {
      // If this is set as default, unset any existing default addresses
      if (address.is_default) {
        await this.clearDefaultAddress(address.user_id);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert(address)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error creating address:', error);
      return null;
    }
  },

  async updateAddress(
    id: number,
    address: Partial<AddressType>
  ): Promise<AddressType | null> {
    try {
      // If this is set as default, unset any existing default addresses
      if (address.is_default) {
        const currentAddress = await this.getAddressById(id);
        if (currentAddress) {
          await this.clearDefaultAddress(currentAddress.user_id);
        }
      }

      const { data, error } = await supabase
        .from('addresses')
        .update(address)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error(`Error updating address with id ${id}:`, error);
      return null;
    }
  },

  async deleteAddress(id: number): Promise<boolean> {
    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error(`Error deleting address with id ${id}:`, error);
      return false;
    }
  },

  async clearDefaultAddress(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('is_default', true);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error(
        `Error clearing default address for user ${userId}:`,
        error
      );
    }
  },
};
