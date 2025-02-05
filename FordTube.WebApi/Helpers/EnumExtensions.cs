using System.ComponentModel;

namespace FordTube.WebApi.Helpers
{
    public static class EnumExtensions
    {
        /// <summary>
        /// Returns Enum Value from Enum Description
        /// </summary>
        /// <typeparam name="T">Enum Type</typeparam>
        /// <param name="description">Description</param>
        /// <param name="defaultValue">Default Value</param>
        /// <returns>Enum Value</returns>
        public static T GetValueFromDescription<T>(string description, T defaultValue) where T : Enum
        {
            var type = typeof(T);
            if (!type.IsEnum) throw new InvalidOperationException();

            foreach (var field in type.GetFields())
            {
                if (Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute)) is DescriptionAttribute attribute)
                {
                    if (string.Equals(attribute.Description, description, StringComparison.InvariantCultureIgnoreCase))
                    {
                        return (T)field.GetValue(null);
                    }
                }
                else
                {
                    if (string.Equals(field.Name, description, StringComparison.InvariantCultureIgnoreCase))
                    {
                        return (T)field.GetValue(null);
                    }
                }
            }
            return defaultValue;
        }

        /// <summary>
        /// Returns Enum Description from Enum Value
        /// </summary>
        /// <param name="value">Enum Value</param>
        /// <returns>Description</returns>
        public static string GetDescriptionFromValue(Enum value)
        {
            return value.GetType().GetField(value.ToString())?.GetCustomAttributes(typeof(DescriptionAttribute), false).SingleOrDefault() is not DescriptionAttribute attribute
                ? value.ToString()
                : attribute.Description;
        }

        /// <summary>
        /// Converts the string representation of the name or numeric value of one or more enumerated constants to an equivalent enumerated object.
        /// </summary>
        /// <typeparam name="T">Enum Type</typeparam>
        /// <param name="value">String Value</param>
        /// <returns>Enum Value</returns>
        public static T ParseEnum<T>(string value) where T : Enum
        {
            return (T)Enum.Parse(typeof(T), value, true);
        }
    }
}
