import each from 'lodash/each';
import get from 'lodash/get';
import isObject from 'lodash/isObject';
import { ComponentConfigsType, getComponentConfig, LEGO_BRIDGE, PROPS_TYPES } from 'brickd-core';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import isUndefined from 'lodash/isUndefined';
import { useEffect, useRef } from 'react';
import { selectClassTarget } from '../common/constants';

export const SPECIAL_STRING_CONSTANTS: any = {
  'null': null,
};


export const formatSpecialProps = (props: any, propsConfig: any) => {
  const nextProps = props;
  each(props, (v, k) => {
    if (get(propsConfig, k)) {
      if (!isObject(v)) {
        if (SPECIAL_STRING_CONSTANTS[v] !== undefined) {
          nextProps[k] = SPECIAL_STRING_CONSTANTS[v];
        } else if (propsConfig[k].type === PROPS_TYPES.function) {
          const funcTemplate = get(propsConfig, `${k}.placeholder`);
          if (funcTemplate) {
            nextProps[k] = () => eval(funcTemplate);
          } else {
            nextProps[k] = () => void 0;
          }
        }
      } else if (isObject(v) && !isEmpty(propsConfig[k].childPropsConfig) && isEqual(keys(v), keys(propsConfig[k].childPropsConfig))) {
        formatSpecialProps(v, propsConfig[k].childPropsConfig);
      }
    } else if (isUndefined(v)) {
      delete nextProps[k];
    }

  });
  return nextProps;
};


export function usePrevious<T>(value: any) {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export const iframeSrcDoc = `<!DOCTYPE html>
<html lang="en">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=2.0, user-scalable=yes" />
<body>
<div id="dnd-container" style="width: 100%;height: 100%"></div>
</body>
</html>
`;

export const isEqualKey = (key: string, selectKey?: string | null) => {
  if (!selectKey) return false;
  return selectKey.includes(key) && parseInt(selectKey) === parseInt(key);

};

export const getIframe = (): HTMLIFrameElement => {
  return document.getElementById('dnd-iframe') as HTMLIFrameElement;
};

export const getComponent = (componentName: string) => get(LEGO_BRIDGE.config!.OriginalComponents, componentName, componentName);

export function formatUnit(target: string | null) {
  if (target) {
    const result = target.match(/\d+/);
    if (result) {
      return Number.parseInt(result[0]);
    }
  }

  return null;
}

export const getSelectedNode = (key?: string | null, iframe?: HTMLIFrameElement): HTMLElement | undefined => {
  if (iframe && key) {
    const { contentDocument } = iframe;
    return contentDocument!.getElementsByClassName(selectClassTarget + parseInt(key))[0] as HTMLElement;
  }

};

export function generateCSS(left: number, top: number, width?: number, height?: number) {

  return `
    ${width ? `width:${width}px;` : ''}
    ${height ? `height:${height}px;` : ''}
    display:flex;
    left:${left}px;
    top:${top}px;
  `;
}

export function getElementPosition(element:any) {
  let left = 0;
  let top = 0;
  while (element !== null)  {
    left += element.offsetLeft;
    top += element.offsetTop;
    element = element.offsetParent;
  }
  return {left,  top};
}


export function getElementInfo(element:any) {
  const {left,top }=getElementPosition(element)
  const {width,height}=element.getBoundingClientRect()
  return {width,height,left,top,bottom:top+height,right:left+width}

}

export function getIsModalChild(componentConfigs:ComponentConfigsType,domTreeKeys?:string[]) {
  if(domTreeKeys){
    for (const key of domTreeKeys){
      const {mirrorModalField}=getComponentConfig(get(componentConfigs,[key,'componentName']))||{}
      if(mirrorModalField) return true
    }
  }
  return false
}

export function setPosition(nodes:any[],isModal?:boolean) {
  if(isModal){
    each(nodes,(node)=>node.style.position='fixed')
  }else {
    each(nodes,(node)=>node.style.position='absolute')

  }

}
