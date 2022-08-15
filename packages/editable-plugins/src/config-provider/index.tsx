import React from 'react';
import LocaleProvider from '../locale-provider';
import type { Locale } from '../locale-provider';
import { ConfigContext } from './context';
import zhCN from '../locale/zh_CN';
import zhTW from '../locale/zh_TW';
import enUS from '../locale/en_US';
import jaJP from '../locale/ja_JP';

const locales: Record<string, any> = {
  'zh-CN': zhCN,
  'zh-HK': zhTW,
  'zh-TW': zhTW,
  'en-US': enUS,
  'ja-JP': jaJP,
};
export interface ConfigProviderProps {
  /**
   * 语言包
   * @default en-US
   */
  locale?: Locale;
  /**
   * 语言
   * @default en-US
   */
  lang?: string;

  prefixCls?: string
}

export const defaultPrefixCls = 'editable';

const ConfigProvider: React.FC<ConfigProviderProps> = ({ lang, locale, ...props }) => {
  const {
    children,
  } = props;
  let childNode = children;
  if (lang) {
    locale = locales[lang] as any;
  }
  if (locale) {
    childNode = <LocaleProvider locale={locale}>{children}</LocaleProvider>;
  }

  const getPrefixCls = React.useCallback(
    (suffixCls?: string, customizePrefixCls?: string) => {
      if (customizePrefixCls) return customizePrefixCls;

      const mergedPrefixCls = props.prefixCls || defaultPrefixCls;

      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    },
    [props.prefixCls],
  );


  return (
    <ConfigContext.Provider
      value={{
        locale,
        getPrefixCls,
      }}
    >
      {
        childNode
      }
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;
