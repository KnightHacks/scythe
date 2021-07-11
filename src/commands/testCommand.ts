import Command from '../command';

const command: Command = {
  name: 'test',
  run(): void {
    console.log('test');
  }
};

export default command;
