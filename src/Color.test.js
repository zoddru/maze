import test from 'ava';
import Color from './Color';

test('create', t => {
    const c = new Color(175, 200, 225);
    
    t.is(c.toString(), 'rgb(175, 200, 225)');
});

test('creat alpha', t => {
    const c = new Color(175, 200, 225, 0.25);
    
    t.is(c.toString(), 'rgba(175, 200, 225, 0.25)');
});

test('cap', t => {
    const c = new Color(-34, 125, 500);
    
    t.is(c.toString(), 'rgb(0, 125, 255)');
});

test('merge', t => {
    const c1 = new Color(40, 20, 100);
    const c2 = new Color(50, 80, 200);
    const c = c1.merge(c2);

    t.is(c.toString(), 'rgb(45, 50, 150)');
});

test('new alpha', t => {
    const c = new Color(175, 200, 225, 0.25);
    
    t.is(c.newAlpha(0.1).toString(), 'rgba(175, 200, 225, 0.1)');
});