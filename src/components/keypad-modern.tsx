import * as React from 'react';
import  styled  from 'styled-components';
import {KeyButton} from './key-button'

interface KeypadClassicProps extends Stylable {
  handleButton: EventFunc;
}

const BaseKeypadClassic = ({ handleButton, className }: Stylable) => {
  return (
<div className={`${className} keypad-modern`}>

<KeyButton code={'Tab'} text={'AD'} color={'#cd3d45'} left={438} top={239} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit3'} text={'3'} color={'#efedeb'} left={468} top={239} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit7'} text={'7'} color={'#efedeb'} left={500} top={239} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'KeyB'} text={'B'} color={'#efedeb'} left={531} top={239} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'KeyF'} text={'F'} color={'#efedeb'} left={562} top={239} handleButton={handleButton}>
</KeyButton>

<KeyButton code={'Enter'} text={'GO'} color={'#cd3d45'} left={438} top={270} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit2'} text={'2'} color={'#efedeb'} left={468} top={270} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit6'} text={'6'} color={'#efedeb'} left={500} top={270} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'KeyA'} text={'A'} color={'#efedeb'} left={531} top={270} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'KeyE'} text={'E'} color={'#efedeb'} left={562} top={270} handleButton={handleButton}>
</KeyButton>

<KeyButton code={'ArrowDown'} text={'-'} color={'#cd3d45'} left={438} top={301} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit1'} text={'1'} color={'#efedeb'} left={468} top={301} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit5'} text={'5'} color={'#efedeb'} left={500} top={301} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit9'} text={'9'} color={'#efedeb'} left={531} top={301} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'KeyD'} text={'D'} color={'#efedeb'} left={562} top={301} handleButton={handleButton}>
</KeyButton>

<KeyButton code={'ArrowUp'} text={'+'} color={'#cd3d45'} left={438} top={331} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit0'} text={'0'} color={'#efedeb'} left={468} top={331} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit4'} text={'4'} color={'#efedeb'} left={500} top={332} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'Digit8'} text={'8'} color={'#efedeb'} left={531} top={332} handleButton={handleButton}>
</KeyButton>
<KeyButton code={'KeyC'} text={'C'} color={'#efedeb'} left={562} top={332} handleButton={handleButton}>
</KeyButton>
</div>
  );
};

export const KeypadClassic = styled(BaseKeypadClassic)`
`
