import { toast } from 'sonner';
import { Button } from '@/shared/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/Dialog';
import { CONTACT } from '@/shared/constants';

type MailToProps = {
  iconSrc?: string;
};

const MailTo = ({ iconSrc = '/assets/icons/nyaomaru_web_icon_mail.svg' }: MailToProps) => {
  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(CONTACT.EMAIL);
      toast('Mail address copied!');
    } catch (error) {
      console.error('Failed to copy mail address:', error);
      toast('Failed to copy mail address. Please try again.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span
          role='button'
          tabIndex={0}
          aria-label='Send email'
          className='w-10 h-10 text-center justify-center items-center flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
        >
          <img src={iconSrc} alt='email icon' className='h-7 w-7' />
        </span>
      </DialogTrigger>
      <DialogContent className='text-center space-y-2 sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Contact via Email</DialogTitle>
          <DialogDescription className='text-sm text-sub'>
            Please copy the email address below
          </DialogDescription>
        </DialogHeader>
        <p className='font-medium text-lg'>{CONTACT.EMAIL}</p>
        <Button variant='outline' onClick={handleCopy} className='gap-2 group'>
          <img
            src='/assets/icons/nyaomaru_web_icon_copy.svg'
            alt='copy email icon'
            className='w-4 h-4 transition group-hover:brightness-0'
          />
          Copy
        </Button>
      </DialogContent>
    </Dialog>
  );
};
MailTo.displayName = 'MailTo';

export { MailTo };
