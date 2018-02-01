import test from 'ava';
import Utility from './Utility';

test('randomItem except', t => {
    const items = [0, 1, 2, 3, 4, 5];
    
    let item;

    for (let i = 0; i < 100; i++) {
        item = Utility.randomItem(items, [2]);

        t.true(item !== 2);
        t.true(item === 0 || item === 1 || item === 3 || item === 4 || item === 5);
    }
});