using ExactTargetService;
using System;
using System.Threading.Tasks;

namespace FordTube.EmailsService
{
    public static class EmailsSender
    {
        public static Task<SendExactTargetEmailResponse> SendEmail(EmailMessage msg)
        {
            ExactTargetServiceSoapClient et = new ExactTargetServiceSoapClient(ExactTargetServiceSoapClient.EndpointConfiguration.ExactTargetServiceSoap);

            return et.SendExactTargetEmailAsync(msg.Subject, msg.ToEmail, msg.FromEmail, msg.FromName, ((int)msg.CustomerKey).ToString(), msg.StatusMessage, msg.eCert, msg.CustName, msg.Address, msg.Address2, msg.ExpDate, msg.VIN, msg.Phone, msg.VideoTitle, msg.VideoLink, msg.Param3, msg.Comment, msg.VideoLink2, msg.Param6, msg.Param7, msg.Param8, msg.Param9, msg.Param10, msg.BccEmail, msg.CcEmail);
        }
    }
}
