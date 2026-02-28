/**
 * Address Edit/Create Page
 * Migrated from moon-agent/app/profile/addresses/[id]/page.tsx for Taro
 *
 * Supports both create (no id) and edit (with id) modes.
 * Uses query params: ?id=xxx for edit mode
 *
 * Uses NutUI Cascader for province/city/district selection
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Input, Switch } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { Button, Dialog, Cascader } from '@nutui/nutui-react-taro';
import { Arrow, Delete } from '@taroify/icons';
import {
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  getAreaTree,
  getAreaPath,
  getFullAreaName,
  convertToCascaderOptions,
  type CreateAddressParams,
  type AreaNode,
  type CascaderOption,
} from '@core/address';

type FormData = {
  name: string;
  mobile: string;
  areaId: number;
  areaName: string;
  detailAddress: string;
  defaultStatus: boolean;
};

type FormErrors = {
  name?: string;
  mobile?: string;
  areaId?: string;
  detailAddress?: string;
};

export default function AddressEditPage() {
  const router = useRouter();

  // Parse query params
  const addressId = router.params?.id ? parseInt(router.params.id, 10) : null;
  const mode = router.params?.mode === 'select' ? 'select' : 'manage';
  const callbackUrl = router.params?.callbackUrl || '';

  const isEditMode = !!addressId;
  const pageTitle = isEditMode ? '编辑地址' : '添加新地址';

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    areaId: 0,
    areaName: '',
    detailAddress: '',
    defaultStatus: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Area picker state
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [areaTree, setAreaTree] = useState<AreaNode[]>([]);
  const [areaOptions, setAreaOptions] = useState<CascaderOption[]>([]);
  const [selectedAreaPath, setSelectedAreaPath] = useState<string[]>([]);

  // Fetch area tree
  useEffect(() => {
    getAreaTree()
      .then((response) => {
        if (response.code === 0 && response.data) {
          setAreaTree(response.data);
          setAreaOptions(convertToCascaderOptions(response.data));
        }
      })
      .catch(() => {
        console.error('Failed to fetch area tree');
      });
  }, []);

  // Fetch address data for edit mode
  useEffect(() => {
    if (isEditMode && addressId) {
      setIsFetching(true);
      getAddress(addressId)
        .then((response) => {
          if (response.code === 0 && response.data) {
            const addr = response.data;
            setFormData({
              name: addr.name,
              mobile: addr.mobile,
              areaId: addr.areaId,
              areaName: addr.areaName || '',
              detailAddress: addr.detailAddress,
              defaultStatus: addr.defaultStatus,
            });
            // Set selected area path for cascader
            if (areaTree.length > 0 && addr.areaId) {
              const path = getAreaPath(areaTree, addr.areaId);
              setSelectedAreaPath(path.map(String));
            }
          } else {
            Taro.showToast({
              title: response.msg || '获取地址失败',
              icon: 'none',
            });
          }
        })
        .catch(() => {
          Taro.showToast({
            title: '获取地址失败',
            icon: 'none',
          });
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [isEditMode, addressId, areaTree]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    const params = new URLSearchParams();
    if (mode === 'select') {
      params.set('mode', 'select');
    }
    if (callbackUrl) {
      params.set('callbackUrl', callbackUrl);
    }
    const queryString = params.toString();
    Taro.navigateTo({
      url: `/pages/profile/addresses/index${queryString ? `?${queryString}` : ''}`,
    });
  }, [mode, callbackUrl]);

  // Update form field
  const updateField = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error when field is updated
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // Handle area path change (called on each level selection)
  const handleAreaPathChange = useCallback(
    (value: (string | number)[], selectedOptions: CascaderOption[]) => {
      // Update selected path for UI display
      setSelectedAreaPath(value.map(String));
      
      // Get the last selected item
      const lastOption = selectedOptions[selectedOptions.length - 1];
      if (lastOption) {
        const areaId = parseInt(String(lastOption.value), 10);
        const areaName = selectedOptions.map((opt) => opt.text).join('');
        updateField('areaId', areaId);
        updateField('areaName', areaName);
        
        // Close picker if the last option has no children (leaf node - district level)
        // This handles the case where we've selected province -> city -> district
        if (!lastOption.children || lastOption.children.length === 0) {
          setShowAreaPicker(false);
        }
      }
    },
    [updateField]
  );

  // Handle area selection complete (final confirmation)
  const handleAreaChange = useCallback(
    (value: (string | number)[], selectedOptions: CascaderOption[]) => {
      // This is called when user confirms selection
      const lastOption = selectedOptions[selectedOptions.length - 1];
      if (lastOption) {
        const areaId = parseInt(String(lastOption.value), 10);
        const areaName = selectedOptions.map((opt) => opt.text).join('');
        updateField('areaId', areaId);
        updateField('areaName', areaName);
        setSelectedAreaPath(value.map(String));
      }
      setShowAreaPicker(false);
    },
    [updateField]
  );

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入收货人姓名';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = '请输入手机号码';
    } else if (!/^1[3-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = '请输入正确的手机号码';
    }

    if (!formData.areaId || formData.areaId === 0) {
      newErrors.areaId = '请选择所在地区';
    }

    if (!formData.detailAddress.trim()) {
      newErrors.detailAddress = '请输入详细地址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const params: CreateAddressParams = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        areaId: formData.areaId,
        detailAddress: formData.detailAddress.trim(),
        defaultStatus: formData.defaultStatus,
      };

      let response;
      if (isEditMode && addressId) {
        response = await updateAddress({ id: addressId, ...params });
      } else {
        response = await createAddress(params);
      }

      if (response.code === 0) {
        Taro.showToast({
          title: isEditMode ? '保存成功' : '添加成功',
          icon: 'success',
        });
        setTimeout(() => {
          handleBack();
        }, 1000);
      } else {
        Taro.showToast({
          title: response.msg || '保存失败',
          icon: 'none',
        });
      }
    } catch {
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none',
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, isEditMode, addressId, handleBack]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!addressId) return;

    setIsLoading(true);
    setShowDeleteDialog(false);

    try {
      const response = await deleteAddress(addressId);
      if (response.code === 0) {
        Taro.showToast({
          title: '删除成功',
          icon: 'success',
        });
        setTimeout(() => {
          handleBack();
        }, 1000);
      } else {
        Taro.showToast({
          title: response.msg || '删除失败',
          icon: 'none',
        });
      }
    } catch {
      Taro.showToast({
        title: '删除失败，请重试',
        icon: 'none',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addressId, handleBack]);

  return (
    <View className='flex flex-col min-h-screen bg-page-gradient'>
      {/* Header */}
      <View className='sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100'>
        <View
          className='w-10 h-10 flex items-center justify-center -ml-2'
          onClick={handleBack}
        >
          <Arrow direction='left' size={20} className='text-gray-600' />
        </View>
        <Text className='text-lg font-semibold text-moon-text flex-1'>
          {pageTitle}
        </Text>
        {isEditMode && (
          <View
            className='w-10 h-10 flex items-center justify-center'
            onClick={() => setShowDeleteDialog(true)}
          >
            <Delete size={20} className='text-red-500' />
          </View>
        )}
      </View>

      {/* Form */}
      {isFetching ? (
        <View className='flex-1 flex items-center justify-center'>
          <Text className='text-moon-text-muted'>加载中...</Text>
        </View>
      ) : (
        <View className='flex-1 p-4'>
          <View className='bg-white rounded-xl p-4 border border-gray-100'>
            {/* Name Field */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-moon-text block mb-2'>
                收货人 <Text className='text-red-500'>*</Text>
              </Text>
              <Input
                className={`w-full h-10 px-3 box-border rounded-lg border bg-white ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder='请输入收货人姓名'
                value={formData.name}
                onInput={(e) => updateField('name', e.detail.value)}
              />
              {errors.name && (
                <Text className='text-sm text-red-500 block mt-1'>
                  {errors.name}
                </Text>
              )}
            </View>

            {/* Mobile Field */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-moon-text block mb-2'>
                手机号码 <Text className='text-red-500'>*</Text>
              </Text>
              <Input
                className={`w-full h-10 px-3 box-border rounded-lg border bg-white ${
                  errors.mobile ? 'border-red-500' : 'border-gray-200'
                }`}
                type='number'
                placeholder='请输入11位手机号码'
                maxlength={11}
                value={formData.mobile}
                onInput={(e) => updateField('mobile', e.detail.value)}
              />
              {errors.mobile && (
                <Text className='text-sm text-red-500 block mt-1'>
                  {errors.mobile}
                </Text>
              )}
            </View>

            {/* Area Selection - Using NutUI Cascader */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-moon-text block mb-2'>
                所在地区 <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`w-full h-10 px-3 box-border rounded-lg border flex items-center justify-between bg-white ${
                  errors.areaId ? 'border-red-500' : 'border-gray-200'
                }`}
                onClick={() => setShowAreaPicker(true)}
              >
                <Text
                  className={
                    formData.areaName ? 'text-moon-text' : 'text-gray-400'
                  }
                >
                  {formData.areaName || '请选择省市区'}
                </Text>
                <Arrow direction='right' size={16} className='text-gray-400' />
              </View>
              {errors.areaId && (
                <Text className='text-sm text-red-500 block mt-1'>
                  {errors.areaId}
                </Text>
              )}
            </View>

            {/* Detail Address Field */}
            <View className='mb-4'>
              <Text className='text-sm font-medium text-moon-text block mb-2'>
                详细地址 <Text className='text-red-500'>*</Text>
              </Text>
              <Input
                className={`w-full h-10 px-3 box-border rounded-lg border bg-white ${
                  errors.detailAddress ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder='请输入详细地址（街道、门牌号等）'
                value={formData.detailAddress}
                onInput={(e) => updateField('detailAddress', e.detail.value)}
              />
              {errors.detailAddress && (
                <Text className='text-sm text-red-500 block mt-1'>
                  {errors.detailAddress}
                </Text>
              )}
            </View>

            {/* Default Address Toggle */}
            <View className='flex items-center justify-between py-2'>
              <Text className='text-sm font-medium text-moon-text'>
                设为默认地址
              </Text>
              <Switch
                checked={formData.defaultStatus}
                onChange={(e) => updateField('defaultStatus', e.detail.value)}
                color='#8b5cf6'
              />
            </View>
          </View>
        </View>
      )}

      {/* Bottom Button */}
      {!isFetching && (
        <View className='px-4 py-4 bg-white border-t border-gray-100 safe-area-inset-bottom'>
          <Button
            type='primary'
            color='#8b5cf6'
            className='w-full rounded-full!'
            loading={isLoading}
            disabled={isLoading}
            onClick={handleSave}
          >
            {isLoading ? '保存中...' : isEditMode ? '保存修改' : '添加地址'}
          </Button>
        </View>
      )}

      {/* Area Picker - NutUI Cascader */}
      <Cascader
        visible={showAreaPicker}
        value={selectedAreaPath}
        title='选择地区'
        options={areaOptions}
        activeColor='#8b5cf6'
        onClose={() => setShowAreaPicker(false)}
        onChange={handleAreaChange}
        onPathChange={handleAreaPathChange}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        visible={showDeleteDialog}
        title='删除地址'
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        confirmText='删除'
        cancelText='取消'
      >
        确定要删除这个地址吗？
      </Dialog>
    </View>
  );
}
