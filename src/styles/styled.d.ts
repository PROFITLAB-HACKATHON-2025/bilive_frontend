import 'styled-components';
import type { ThemeType } from './theme';

declare module 'styled-components' {
    // extends를 사용하지 않고 내부에서 속성을 직접 정의합니다.
    export interface DefaultTheme {
        colors: ThemeType['colors'];
        // 만약 theme.ts에 다른 속성(fontSizes 등)이 있다면 아래와 같이 추가하세요.
        // fontSizes: ThemeType['fontSizes'];
    }
}