export const getPrefixCls = (suffixCls?: string, customizePrefixCls?: string) => {
  if (customizePrefixCls) return customizePrefixCls;

  const mergedPrefixCls = 'editable-ui';

  return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
}