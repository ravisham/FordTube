using System.Threading;
using System.Threading.Tasks;


namespace FordTube.VBrick.Wrapper.Locking
{
    /// <summary>
    /// Struct to tie the lock type and the TaskCompletionSource, to trigger the awaited lock task
    /// </summary>
    internal class QueuedAction
    {
        public bool IsWriterLock { get; }
        public TaskCompletionSource<object> CompletionSource { get; }
        public SynchronizationContext Context { get; }

        public QueuedAction(bool isWriterLock, TaskCompletionSource<object> completionSource, SynchronizationContext context)
        {
            IsWriterLock = isWriterLock;
            CompletionSource = completionSource;
            Context = context;
        }
    }
}