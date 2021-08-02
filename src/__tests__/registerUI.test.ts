import { MessageActionRow } from 'discord.js';
import { Button, LinkButton, toDiscordUI, UI } from '..';
import { SelectMenu, SelectOption } from '../UI';

describe('toDiscordUI()', () => {
  let buttonListeners = new Map();
  let selectMenuListeners = new Map();
  const registerUI = (ui: UI) =>
    toDiscordUI(ui, buttonListeners, selectMenuListeners);
  beforeEach(() => {
    buttonListeners = new Map();
    selectMenuListeners = new Map();
  });
  test('a single button', () => {
    const ui: Button = {
      style: 'PRIMARY',
      onClick() {
        return;
      },
    };
    expect(registerUI(ui)).toStrictEqual([
      new MessageActionRow({
        components: [
          {
            type: 'BUTTON',
            style: 'PRIMARY',
            customId: expect.anything(),
          },
        ],
      }),
    ]);
    expect(buttonListeners.size).toBe(1);
    expect(selectMenuListeners.size).toBe(0);
    expect([...buttonListeners.values()][0]).toBe(ui.onClick);
  });

  test('multiple buttons', () => {
    const ui: UI = [
      {
        style: 'PRIMARY',
        onClick() {
          return;
        },
      },
      {
        style: 'LINK',
        url: 'https://example.com',
      },
    ];
    expect(registerUI(ui)).toStrictEqual([
      new MessageActionRow({
        components: [
          {
            type: 'BUTTON',
            style: 'PRIMARY',
            customId: expect.anything(),
          },
          {
            type: 'BUTTON',
            style: 'LINK',
            url: 'https://example.com',
          },
        ],
      }),
    ]);
    expect(buttonListeners.size).toBe(1);
    expect(selectMenuListeners.size).toBe(0);
  });

  test('link buttons don\'t register a callback', () => {
    const ui: LinkButton = {
      style: 'LINK',
      url: 'https://example.com',
    };
    registerUI(ui);
    expect(buttonListeners.size).toBe(0);
    expect(selectMenuListeners.size).toBe(0);
  });

  test('select menus', () => {
    const options: SelectOption[] = [
      { label: '1' },
      { label: '2' },
      { label: '3' },
      { label: '4' },
    ];
    const ui: SelectMenu = {
      onSelect() {
        return;
      },
      options,
    };
    expect(registerUI(ui)).toStrictEqual([
      new MessageActionRow({
        components: [
          {
            type: 'SELECT_MENU',
            customId: expect.anything(),
            options: [
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
              { label: '4', value: '4' },
            ],
          },
        ],
      }),
    ]);
    expect(buttonListeners.size).toBe(0);
    expect(selectMenuListeners.size).toBe(1);
    expect([...selectMenuListeners.values()][0]).toBe(ui.onSelect);
  });

  test('select menu options can override .value', () => {
    const options: SelectOption[] = [
      { label: '1' },
      { label: '2', value: 'something else' },
      { label: '3' },
      { label: '4' },
    ];
    const ui: SelectMenu = {
      onSelect() {
        return;
      },
      options,
    };
    expect(registerUI(ui)).toStrictEqual([
      new MessageActionRow({
        components: [
          {
            type: 'SELECT_MENU',
            customId: expect.anything(),
            options: [
              { label: '1', value: '1' },
              { label: '2', value: 'something else' },
              { label: '3', value: '3' },
              { label: '4', value: '4' },
            ],
          },
        ],
      }),
    ]);
    expect(buttonListeners.size).toBe(0);
    expect(selectMenuListeners.size).toBe(1);
    expect([...selectMenuListeners.values()][0]).toBe(ui.onSelect);
  });

  test('having both button rows and select menu rows', () => {
    const options: SelectOption[] = [
      { label: '1' },
      { label: '2' },
      { label: '3' },
      { label: '4' },
    ];
    const ui: UI = [
      [
        {
          style: 'PRIMARY',
          onClick() {
            return;
          },
        },
        {
          style: 'LINK',
          url: 'https://example.com',
        },
        {
          style: 'SECONDARY',
          onClick() {
            return;
          },
        },
      ],
      [
        {
          onSelect() {
            return;
          },
          options,
        },
      ],
      [
        {
          style: 'LINK',
          url: 'https://example.com',
        },
        {
          style: 'DANGER',
          onClick() {
            return;
          },
        },
        {
          style: 'SUCCESS',
          onClick() {
            return;
          },
        },
      ],
    ];
    expect(registerUI(ui)).toStrictEqual([
      new MessageActionRow({
        components: [
          {
            type: 'BUTTON',
            style: 'PRIMARY',
            customId: expect.anything(),
          },
          {
            type: 'BUTTON',
            style: 'LINK',
            url: 'https://example.com',
          },
          {
            type: 'BUTTON',
            style: 'SECONDARY',
            customId: expect.anything(),
          },
        ],
      }),
      new MessageActionRow({
        components: [
          {
            type: 'SELECT_MENU',
            customId: expect.anything(),
            options: [
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
              { label: '4', value: '4' },
            ],
          },
        ],
      }),
      new MessageActionRow({
        components: [
          {
            type: 'BUTTON',
            style: 'LINK',
            url: 'https://example.com',
          },
          {
            type: 'BUTTON',
            style: 'DANGER',
            customId: expect.anything(),
          },
          {
            type: 'BUTTON',
            style: 'SUCCESS',
            customId: expect.anything(),
          },
        ],
      }),
    ]);
    expect(buttonListeners.size).toBe(4);
    expect(selectMenuListeners.size).toBe(1);
  });
});
