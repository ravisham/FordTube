
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;


namespace FordTube.VBrick.Wrapper.Locking
{
    public sealed class AsyncReadersWriterLock
    {
        private static readonly SynchronizationContext DefaultContext = new SynchronizationContext();
        private readonly List<QueuedAction> _readersWritersQueue = new List<QueuedAction>();
        private int _activeReaders;
        private bool _writerActive;

        public ValueTask UseReaderAsync(Func<ValueTask> asyncAction) =>
            ExecuteWithinLockAsync(false, asyncAction);

        public ValueTask<T> UseReaderAsync<T>(Func<ValueTask<T>> asyncFunc) =>
            ExecuteWithinLockAsync(false, asyncFunc);

        public ValueTask<T> UseReaderAsync<T>(Func<T> func) =>
            ExecuteWithinLockAsync(false, func);


        public ValueTask UseReaderAsync(Action action) =>
             ExecuteWithinLockAsync(false, action);


        public ValueTask UseWriterAsync<T>(Func<ValueTask> asyncAction) =>
            ExecuteWithinLockAsync(true, asyncAction);

        public ValueTask<T> UseWriterAsync<T>(Func<ValueTask<T>> asyncFunc) =>
            ExecuteWithinLockAsync(true, asyncFunc);

        public ValueTask<T> UseWriterAsync<T>(Func<T> func) =>
            ExecuteWithinLockAsync(true, func);

        public ValueTask UseWriterAsync(Action action) =>
            ExecuteWithinLockAsync(true, action);

        private bool IsActionQueued(bool isWriterLock, out Task completionTask)
        {
            lock (_readersWritersQueue)
            {
                if ((isWriterLock && (_activeReaders > 0)) || _writerActive || _readersWritersQueue.Count > 0)
                {
                    var tcs = new TaskCompletionSource<object>();

                    _readersWritersQueue.Add(new QueuedAction(isWriterLock, tcs, SynchronizationContext.Current ?? DefaultContext));

                    completionTask = tcs.Task;

                    return true;
                }
                else
                {
                    if (isWriterLock)
                        _writerActive = true;
                    else
                        _activeReaders++;

                    completionTask = default;

                    return false;
                }
            }
        }

        private async ValueTask ExecuteWithinLockAsync(bool isWriterLock, Action action)
        {
            if (IsActionQueued(isWriterLock, out var completionTask))
                await completionTask;

            try
            {
                action();
            }
            finally
            {
                ReleaseLockAndCheckQueue(isWriterLock);
            }
        }

        private async ValueTask<T> ExecuteWithinLockAsync<T>(bool isWriterLock, Func<T> func)
        {
            if (IsActionQueued(isWriterLock, out var completionTask))
                await completionTask;

            try
            {
                return func();
            }
            finally
            {
                ReleaseLockAndCheckQueue(isWriterLock);
            }
        }

        private async ValueTask<T> ExecuteWithinLockAsync<T>(bool isWriterLock, Func<ValueTask<T>> asyncFunc)
        {
            if (IsActionQueued(isWriterLock, out var completionTask))
                await completionTask;

            try
            {
                var result = asyncFunc();

                if (!result.IsCompleted)
                    await result;

                return result.Result;
            }
            finally
            {
                ReleaseLockAndCheckQueue(isWriterLock);
            }
        }

        private async ValueTask ExecuteWithinLockAsync(bool isWriterLock, Func<ValueTask> asyncAction)
        {
            if (IsActionQueued(isWriterLock, out var completionTask))
                await completionTask;

            try
            {
                var result = asyncAction();

                if (!result.IsCompleted)
                    await result;
            }
            finally
            {
                ReleaseLockAndCheckQueue(isWriterLock);
            }
        }

        private void ReleaseLockAndCheckQueue(bool isWriterLock)
        {
            lock (_readersWritersQueue)
            {
                if (isWriterLock)
                    _writerActive = false;
                else
                    _activeReaders--;

                CheckWaitingTasksInQueue();
            }
        }

        private void CheckWaitingTasksInQueue()
        {
            while (true)
            {
                var item = _readersWritersQueue.FirstOrDefault();

                if (item == default)
                    break;     

                if (item.IsWriterLock)
                {
                    if (_activeReaders > 0)
                        break;

                    _readersWritersQueue.RemoveAt(0);
                    _writerActive = true;

                    item.Context.Post(item.CompletionSource.SetResult, null);

                    break;
                }
                _readersWritersQueue.RemoveAt(0);
                _activeReaders++;

                item.Context.Post(item.CompletionSource.SetResult, null);
            }
        }
    }
}